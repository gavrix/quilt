import {useCallback, useContext, useMemo} from 'react';
import type {Resolver} from '@quilted/async';
import {useServerAction} from '@quilted/react-server-render';
import {useSubscription} from '@quilted/use-subscription';

import {AsyncAssetContext} from '../context';
import type {AssetTiming} from '../types';

interface Options {
  immediate?: boolean;
  styles?: AssetTiming;
  scripts?: AssetTiming;
}

export function useAsync<T>(
  resolver: Resolver<T>,
  {scripts, styles, immediate = true}: Options = {},
) {
  const {id} = resolver;
  const load = useCallback(() => resolver.resolve(), [resolver]);

  const value = useSubscription<T | undefined>(
    useMemo(() => {
      return {
        getCurrentValue() {
          return typeof window !== 'undefined' || immediate
            ? resolver.resolved
            : undefined;
        },
        subscribe(callback) {
          return resolver.subscribe(callback);
        },
      };
    }, [immediate, resolver]),
  );

  useAsyncAsset(id, {scripts, styles});

  return value instanceof Error
    ? {id, resolved: null, error: value, loading: false, load}
    : {
        id,
        resolved: value,
        error: null,
        loading: value == null,
        load,
      };
}

export function useAsyncAsset(
  id?: string,
  {scripts, styles}: {styles?: AssetTiming; scripts?: AssetTiming} = {},
) {
  const async = useContext(AsyncAssetContext);

  useServerAction(() => {
    if (async && id) {
      async.markAsUsed(id, {scripts, styles});
    }
  }, async?.serverAction);
}

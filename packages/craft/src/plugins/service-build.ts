import {createProjectPlugin} from '@quilted/sewing-kit';
import type {Service} from '@quilted/sewing-kit';

import {getEntry} from './shared';

declare module '@quilted/sewing-kit' {
  interface BuildServiceOptions {
    /**
     * Indicates that the base build is being generated by `quilt`.
     */
    quilt: true;
  }
}

export function serviceBuild() {
  return createProjectPlugin<Service>({
    name: 'Quilt.Service.Build',
    build({project, workspace, configure, run}) {
      configure(({outputDirectory, rollupInput, rollupOutputs}, {options}) => {
        if (!options.quilt) return;

        rollupInput?.(async () => {
          const entry = await getEntry(project);
          return [entry];
        });

        rollupOutputs?.(async (outputs) => [
          ...outputs,
          {
            format: 'esm',
            dir: await outputDirectory.run(
              workspace.fs.buildPath(
                workspace.services.length > 1
                  ? `services/${project.name}`
                  : 'service',
              ),
            ),
            entryFileNames: 'index.mjs',
          },
        ]);
      });

      run((step, {configuration}) =>
        step({
          name: 'Quilt.Service.Build',
          label: `Build service ${project.name}`,
          async run() {
            const [configure, {buildWithRollup}] = await Promise.all([
              configuration({quilt: true}),
              import('@quilted/sewing-kit-rollup'),
            ]);

            await buildWithRollup(configure);
          },
        }),
      );
    },
  });
}

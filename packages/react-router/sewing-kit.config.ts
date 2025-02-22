import {createPackage, quiltPackage, Runtime} from '@quilted/craft';

export default createPackage((pkg) => {
  pkg.entry({source: './src/index'});
  pkg.entry({source: './src/testing', name: 'testing', runtime: Runtime.Node});
  pkg.use(quiltPackage({react: true}));
});

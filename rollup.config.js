import buble from 'rollup-plugin-buble';
import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

const banner = `\
/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 *
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @preserve
 */
`;

const build = (filename, plugins) => ({
  external: Object.keys(pkg.dependencies || {}),
  input: pkg.module,
  output: {
    banner: banner,
    file: filename,
    format: 'umd',
    name: 'GeojsonFlatbush',
  },
  plugins,
});

export default [
  build('geojson-flatbush.js', [resolve(), buble()]),
  build('geojson-flatbush.min.js', [resolve(), terser(), buble()]),
];

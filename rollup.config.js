import typescript from 'rollup-plugin-typescript2';
import { minify } from 'rollup-plugin-esbuild-minify';

/**@type {import('rollup').RollupOptions}*/
const build = {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'esm',
        name: 'bakutils-catcher',
        compact: true,
    },
    plugins: [
        typescript(),
        minify()
    ],
};

export default build;
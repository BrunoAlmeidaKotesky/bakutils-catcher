import typescript from 'rollup-plugin-typescript2';

export default [
    {
        input: 'index.ts',
        output: {
            file: 'dist/index.js',
            format: 'esm', // "iife" para navegador, "cjs" para CommonJS, "esm" para ES modules
            name: 'bakutils-catcher', // Nome da variável global
        },
        plugins: [typescript()],
    },
    {
        input: 'index.ts',
        output: {
            file: 'dist/index.cjs.js',
            format: 'cjs', // "iife" para navegador, "cjs" para CommonJS, "esm" para ES modules
            name: 'bakutils-catcher', // Nome da variável global
        },
        plugins: [typescript()],
    }
]
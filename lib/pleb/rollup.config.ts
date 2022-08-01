import path from 'path'
import fs from 'fs'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { defineConfig, Plugin } from 'rollup'

const plugins = [json(), typescript(), commonjs(), resolve()] as Plugin[]

const external = [
    'url',
    'react',
    'esbuild',
    'fsevents',
    'events',
    'string_decoder',
    'react/jsx-runtime',
    'react-dom/server',
]

const cliConfig = defineConfig({
    input: path.resolve(__dirname, 'src/bin/pleb.ts'),
    plugins,
    onwarn: (warning, next) => {
        if (warning.code === 'EVAL') return
        next(warning)
    },
    external,
    preserveEntrySignatures: 'strict',
    output: {
        dir: path.resolve(__dirname, 'dist', 'bin'),
        banner: '#!/usr/bin/env node',
    },
})

function copyTsConfig() {
    const packageFiles = ['tsconfig.json', 'package.json', 'README.md']
    return {
        name: 'copy-package-files',
        generateBundle() {
            for (const file of packageFiles) {
                fs.copyFileSync(`./${file}`, `./dist/${file}`)
            }
        },
    }
}

const clientConfig = defineConfig({
    input: path.resolve(__dirname, 'src/client.tsx'),
    external: ['react/jsx-runtime', 'react-dom/client', 'react', 'fsevents'],
    plugins: [
        resolve(),
        typescript({
            tsconfig: path.resolve(__dirname, 'tsconfig.client.json'),
        }),
        commonjs(),
        copyTsConfig(),
    ] as Plugin[],
    output: {
        file: path.resolve(__dirname, 'dist', 'client.js'),
    },
})

export default defineConfig([cliConfig, clientConfig])

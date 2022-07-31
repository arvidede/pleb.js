import path from 'path'
import fs from 'fs'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { defineConfig } from 'rollup'

const plugins = [json(), typescript(), commonjs(), resolve()]

const external = [
    'fs',
    'path',
    'url',
    'react',
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

const serverConfig = defineConfig({
    input: path.resolve(__dirname, 'src/server.ts'),
    plugins,
    external,
    onwarn: (warning, next) => {
        if (warning.code === 'EVAL') return
        next(warning)
    },
    output: {
        dir: path.resolve(__dirname, 'dist', 'server'),
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
    external: ['react/jsx-runtime', 'react-dom/client', 'react'],
    plugins: [
        resolve(),
        typescript({
            tsconfig: path.resolve(__dirname, 'tsconfig.client.json'),
        }),
        commonjs(),
        copyTsConfig(),
    ],
    output: {
        file: path.resolve(__dirname, 'dist', 'client.js'),
    },
})

export default defineConfig([cliConfig, serverConfig, clientConfig])

import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { defineConfig } from 'rollup'

const plugins = [json(), typescript(), commonjs()]

const cliConfig = defineConfig({
    input: path.resolve(__dirname, 'src/bin/pleb.ts'),
    plugins,
    onwarn: (warning, next) => {
        if (warning.code === 'EVAL') return
        next(warning)
    },
    external: [
        'commander',
        'fs',
        'path',
        'vite',
        'compression',
        'url',
        'express',
        'react/jsx-runtime',
        'react-dom/server',
        'chalk',
    ],
    preserveEntrySignatures: 'strict',
    output: {
        dir: path.resolve(__dirname, 'dist', 'bin'),
        banner: '#!/usr/bin/env node',
    },
})

const serverConfig = defineConfig({
    input: path.resolve(__dirname, 'src/server.ts'),
    plugins,
    external: [
        'fs',
        'path',
        'vite',
        'compression',
        'url',
        'express',
        'chalk',
        'react/jsx-runtime',
        'react-dom/server',
    ],
    onwarn: (warning, next) => {
        if (warning.code === 'EVAL') return
        next(warning)
    },
    output: {
        dir: path.resolve(__dirname, 'dist', 'server'),
    },
})

const clientConfig = defineConfig({
    input: path.resolve(__dirname, 'src/client.tsx'),
    plugins: [
        resolve(),
        typescript({
            tsconfig: path.resolve(__dirname, 'tsconfig.client.json'),
        }),
        commonjs(),
    ],
    output: {
        file: path.resolve(__dirname, 'dist', 'client.js'),
    },
})

export default defineConfig([cliConfig, serverConfig, clientConfig])

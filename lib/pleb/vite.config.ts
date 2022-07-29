import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: { port: 3000 },
    build: {
        minify: false,
    },
    root: '',
    ssr: {
        noExternal: ['tsc'],
    },
    resolve: {
        alias: {
            'react/jsx-runtime': 'react/jsx-runtime.js',
        },
    },
})

// import fs from 'fs'
import path from 'path'
import nodeExternals from 'webpack-node-externals'
import webpack from 'webpack'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mode = 'development' //process.env.NODE_ENV || 'production'

/**
 * @type {webpack.Configuration}
 */
const serverConfig = {
    mode,
    entry: {
        server: './src/bin/pleb.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist', 'bin'),
        filename: 'pleb.js',
    },
    target: 'node',
    externalsPresets: { node: true },
    node: {
        global: true,
        __dirname: true,
        __filename: true,
    },
    externals: {
        ...nodeExternals(),
        fs: 'commonjs2 node:fs',
        path: 'commonjs2 node:path',
        url: 'commonjs2 node:url',
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-dom/server': 'ReactDOMServer',
        'webpack-dev-server': 'commonjs2 webpack-dev-server',
        webpack: 'commonjs2 webpack',
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude:
                    /node_modules\/(?!esbuild\/).*|webpack|webpack-dev-server/,
                use: {
                    loader: 'swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                                jsx: true,
                            },
                            transform: {
                                react: {
                                    pragma: 'React.createElement',
                                    pragmaFrag: 'React.Fragment',
                                    throwIfNamespace: true,
                                    development: false,
                                    useBuiltins: false,
                                },
                            },
                        },
                    },
                },
            },
            {
                // Loads the javacript into html template provided.
                // Entry point is set below in HtmlWebPackPlugin in Plugins
                test: /\.html$/,
                use: [{ loader: 'html-loader' }],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            fs: false,
            tls: false,
            net: false,
            path: false,
            zlib: false,
            http: false,
            https: false,
            stream: false,
            crypto: false,
            url: false,
        },
    },
    devServer: {
        allowedHosts: ['http://localhost:3000'],
        port: 3000,
        compress: false,
        static: 'public',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    ],
}

// function copyTsConfig() {
//     const packageFiles = ['tsconfig.json', 'package.json', 'README.md']
//     return {
//         name: 'copy-package-files',
//         generateBundle() {
//             for (const file of packageFiles) {
//                 fs.copyFileSync(`./${file}`, `./dist/${file}`)
//             }
//         },
//     }
// }

/**
 * @type {webpack.Configuration}
 */
const clientConfig = {
    mode,
    entry: {
        client: './src/client.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'client.js',
    },
    externals: {
        react: false,
        'react-dom': false,
        'node:fs': 'commonjs2 node:fs',
        'node:path': 'commonjs2 node:path',
    },
    node: {
        global: true,
        __dirname: true,
        __filename: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude: /node_modules(\/^esbuild)/,
                use: {
                    loader: 'swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                                jsx: true,
                            },
                            transform: {
                                react: {
                                    pragma: 'React.createElement',
                                    pragmaFrag: 'React.Fragment',
                                    throwIfNamespace: true,
                                    development: false,
                                    useBuiltins: false,
                                },
                            },
                        },
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            fs: false,
            tls: false,
            net: false,
            path: false,
            zlib: false,
            http: false,
            https: false,
            stream: false,
            crypto: false,
            url: false,
        },
    },
    plugins: [],
}

export function getConfig(name) {
    switch (name) {
        case 'server':
            return serverConfig
        case 'client':
            return serverConfig
        default:
            throw Error(`No webpack config ${name} could be found`)
    }
}

export default [clientConfig, serverConfig]

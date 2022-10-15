import fs from 'fs'
import path from 'path'
import nodeExternals from 'webpack-node-externals'
import webpack from 'webpack'
import { fileURLToPath } from 'url'
import { __clientBuildDir, __clientDir, __clientPagesDir } from '../constants'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
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
        publicPath: '/',
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

const stripExtension = (file) => file.replace(/\..+$|\//, '')

/**
 * @type {webpack.Configuration}
 */
const clientConfig = {
    watch: true,
    mode,
    entry: () => {
        const pages = fs
            .readdirSync(__clientPagesDir)
            .filter((page) => !/_app.tsx|api/.test(page))

        return pages.reduce((entry, page) => {
            const slug = stripExtension(page)
            entry[page] = {
                import: `${__clientPagesDir}/${page}`,
                fileName: `${__clientBuildDir}/[name][ext]`,
            }
        }, {})
    },
    output: {
        publicPath: '/',
    },
    externals: [],
    devServer: {
        static: {
            directory: path.resolve(__clientDir, 'pages'),
        },
        watchFiles: ['./**/*.tsx', './**/*.jsx'],
        client: {
            logging: 'verbose',
            overlay: true,
            progress: true,
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude: /node_modules/,
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
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'postcss-loader' },
                    { loader: 'sass-loader' },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            path: require.resolve('path-browserify'),
            url: require.resolve('url'),
            react: './node_modules/react',
            'react-dom': './node_modules/react-dom',
            'react/jsx-runtime': './node_modules/react/jsx-runtime.js',
            'react/jsx-dev-runtime': './node_modules/react/jsx-dev-runtime.js',
        },
        alias: {
            react: './node_modules/react',
            'react-dom': './node_modules/react-dom',
            'react/jsx-runtime': './node_modules/react/jsx-runtime.js',
            'react/jsx-dev-runtime': './node_modules/react/jsx-dev-runtime.js',
        },
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
}

export function getConfig(name) {
    switch (name) {
        case 'server':
            return serverConfig
        case 'client':
            return clientConfig
        default:
            throw Error(`No webpack config ${name} could be found`)
    }
}

export default [clientConfig, serverConfig]

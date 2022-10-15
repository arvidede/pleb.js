import path from 'path'
import webpack from 'webpack'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * @type {webpack.Configuration}
 */
const clientConfig = {
    mode: 'production',
    target: ['web', 'es2020'],
    entry: {
        client: './src/client.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'client.js',
        publicPath: '/',
    },
    externals: {
        react: {
            commonjs: path.join('node_modules', 'react'),
            commonjs2: path.join('node_modules', 'react'),
            amd: 'React',
            root: 'React',
        },
        'react-dom': {
            commonjs: path.join('node_modules', 'react-dom'),
            commonjs2: path.join('node_modules', 'react-dom'),
            amd: 'ReactDOM',
            root: 'ReactDOM',
        },
        'react-dom/client': {
            commonjs: path.join('node_modules', 'react-dom/client'),
            commonjs2: path.join('node_modules', 'react-dom/client'),
            amd: 'ReactDOMClient',
            root: 'ReactDOMClient',
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
    plugins: [],
}

export default clientConfig

import { FC } from 'react'
import App from './App'
import { __clientDir } from '../constants'
interface Props {
    pagePath: string
}

const Document: FC<Props> = ({ pagePath }) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <link rel="icon" href="/__pleb/static/favicon.ico" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="theme-color" content="#000000" />
                <meta
                    name="description"
                    content="Web site created using pleb"
                />
                <link
                    rel="apple-touch-icon"
                    href="/__pleb/static/logo192.png"
                />
                <link rel="manifest" href="/__pleb/static/manifest.json" />
                <link rel="modulepreload" href="/__pleb/static/client.js" />
                <title>Pleb App</title>
            </head>
            <body>
                <div id="__pleb">
                    <App pagePath={pagePath} />
                </div>
                <script id="PLEB_DATA"></script>
                <script type="module" src="/__pleb/static/client.js"></script>
            </body>
        </html>
    )
}

export default Document

import { FC, lazy, Suspense } from 'react'
import App from './App'
import { __clientDir } from '../constants'
interface Props {
    pagePath: string
}

const routes: Record<string, any> = {
    '/': lazy(() => import(`${__clientDir}/pages/index.tsx`)),
}

const Document: FC<Props> = ({ pagePath }) => {
    const Component = routes[pagePath]
    console.log('Getting component for path', pagePath)
    console.log('Component', Component)
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <link rel="icon" href="/favicon.ico" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta name="theme-color" content="#000000" />
                <meta
                    name="description"
                    content="Web site created using pleb"
                />
                <link rel="apple-touch-icon" href="/logo192.png" />
                <link rel="manifest" href="/manifest.json" />
                <script type="module" src="/client.js"></script>
                <script type="module" src={pagePath}></script>
                <title>Pleb App</title>
            </head>
            <body>
                <div id="__pleb">
                    <Suspense>
                        <App>
                            <Component />
                        </App>
                    </Suspense>
                </div>
                <script id="PLEB_DATA"></script>
            </body>
        </html>
    )
}

export default Document

import React, { FC, ReactElement } from 'react'

interface Props {
    children: ReactElement | ReactElement[]
}

const Document: FC<Props> = ({ children }) => {
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
                <title>Pleb App</title>
            </head>
            <body>
                <div id="__pleb">{children}</div>
            </body>
            <script id="PLEB_DATA"></script>
            <script type="module" src="/render/client.js"></script>
        </html>
    )
}

export default Document

import { FC, ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import App from '../pages/App'
import Document from '../pages/Document'

const ServerContext: FC<{ children: ReactElement | ReactElement[] }> = ({
    children,
}) => {
    return <>{children}</>
}

export const render = (Page: any, pagePath: string) => {
    return ReactDOMServer.renderToString(
        <Document pagePath={pagePath}>
            <ServerContext>
                <App>
                    <Page />
                </App>
            </ServerContext>
        </Document>
    )
}

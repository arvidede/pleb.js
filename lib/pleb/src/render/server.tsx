import { FC, ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import App from '../pages/App'
import Document from '../pages/Document'

const ServerContext: FC<{ children: ReactElement | ReactElement[] }> = ({
    children,
}) => {
    return <App>{children}</App>
}

export const render = (Page: any, pagePath: string) => {
    const App = (
        <Document pagePath={pagePath}>
            <ServerContext>
                <Page />
            </ServerContext>
        </Document>
    )

    return ReactDOMServer.renderToString(App)
}

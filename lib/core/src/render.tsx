import hydrate from './client/hydrate'
import { FC, ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import App from './pages/App'
import document from './pages/document'

const ServerContext: FC<{ children: ReactElement | ReactElement[] }> = ({
    children,
}) => {
    return <App>{children}</App>
}

export const renderPageToString = (Page: any) => {
    const App = (
        <ServerContext>
            <Page />
        </ServerContext>
    )
    return document(ReactDOMServer.renderToString(App), hydrate(App))
}

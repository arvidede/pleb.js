import { FC, ReactElement } from 'react'
import ReactDOM from 'react-dom/server'
import App from './pages/App'
import document from './pages/document'

const ServerContext: FC<{ children: ReactElement | ReactElement[] }> = ({
    children,
}) => {
    return <App>{children}</App>
}

export const renderPageToString = (Page: any) => {
    return document(
        ReactDOM.renderToString(
            <ServerContext>
                <Page />
            </ServerContext>
        )
    )
}

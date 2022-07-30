import ReactDOMServer from 'react-dom/server'
import Document from '../pages/Document'

export const render = (pagePath: string) => {
    return ReactDOMServer.renderToPipeableStream(
        <Document pagePath={pagePath} />
    )
}

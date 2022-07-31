import ReactDOMServer from 'react-dom/server'
import Document from '../pages/Document'

export const render = (
    pagePath: string,
    streamOptions: ReactDOMServer.RenderToPipeableStreamOptions
) => {
    return ReactDOMServer.renderToPipeableStream(
        <Document pagePath={pagePath} />,
        streamOptions
    )
}

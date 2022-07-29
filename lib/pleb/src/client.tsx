import { FC, ReactElement } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import AppTemplate from './pages/App'
import Document from './pages/Document'

const ServerContext: FC<{ children: ReactElement | ReactElement[] }> = ({
    children,
}) => {
    return <AppTemplate>{children}</AppTemplate>
}

const main = () => {
    const ROOT_NODE = '#__pleb'

    const rootNode = document.querySelector(ROOT_NODE)

    if (!rootNode) {
        console.error('Could not find root node', ROOT_NODE)
        return
    }

    const App = (
        <Document>
            <ServerContext>{}</ServerContext>
        </Document>
    )

    // @ts-ignore
    if (import.meta.hot) {
        const root = createRoot(rootNode)
        root.render(App)
    } else {
        hydrateRoot(rootNode, App)
    }
}

main()

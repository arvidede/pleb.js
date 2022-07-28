import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from '../pages/App'
import Component from '../examples/'

const main = () => {
    // const Page = lazy(() => import('pages' + window.location.pathname))
    const ROOT_NODE = '#__pleb'

    const rootNode = document.querySelector(ROOT_NODE)

    if (!rootNode) {
        console.error('Could not find root node', ROOT_NODE)
        return
    }

    // @ts-ignore
    if (import.meta.hot) {
        const root = createRoot(rootNode)
        root.render(
            <App>
                <Component />
            </App>
        )
    } else {
        hydrateRoot(
            rootNode,
            <App>
                <Component />
            </App>
        )
    }
}

main()

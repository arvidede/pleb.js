import { ReactElement } from 'react'
import ReactDOM from 'react-dom/client'

export default function (App: ReactElement) {
    return function () {
        const ROOT_NODE = '#__pleb'
        const rootNode = document.querySelector(ROOT_NODE)
        if (!rootNode) {
            console.error('Could not find root node', ROOT_NODE)
            return
        }
        ReactDOM.hydrateRoot(rootNode, App)
    }
}

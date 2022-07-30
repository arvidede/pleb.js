import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './pages/App'

const ROOT_MARKER = '#__pleb'
const rootNode = document.querySelector(ROOT_MARKER)

if (rootNode) {
    // @ts-ignore
    if (import.meta.hot) {
        const root = createRoot(rootNode)
        root.render(<App>{}</App>)
    } else {
        hydrateRoot(rootNode, <App>{}</App>)
    }
} else {
    console.error('Could not find root node', ROOT_MARKER)
}

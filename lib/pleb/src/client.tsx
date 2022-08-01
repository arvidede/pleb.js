import { hydrateRoot } from 'react-dom/client'
import App from './pages/App'

const ROOT_MARKER = '#__pleb'
const rootNode = document.querySelector(ROOT_MARKER)

if (rootNode) {
    // const root = createRoot(rootNode)
    // root.render(<App pagePath={location.pathname} />)

    hydrateRoot(rootNode, <App pagePath={location.pathname} />)
} else {
    console.error('Could not find root node', ROOT_MARKER)
}

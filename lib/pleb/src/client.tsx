import { createRoot, hydrateRoot } from 'react-dom/client'
import AppTemplate from './pages/App'

const App = (component: any) => <AppTemplate>{component}</AppTemplate>

export default (component: any) => {
    return `
    (() => {
        const ROOT_NODE = '#__pleb'

        const rootNode = document.querySelector(ROOT_NODE)

        if (!rootNode) {
            console.error('Could not find root node', ROOT_NODE)
            return
        }
        
        if (import.meta.hot) {
            const root = ${createRoot}(rootNode)
            root.render(App)
        } else {
            ${hydrateRoot}(rootNode, ${App(component)})
        }
        console.log('HYDRATE')
    })()`
}

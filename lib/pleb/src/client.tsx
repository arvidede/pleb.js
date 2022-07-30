import { createRoot, hydrateRoot } from 'react-dom/client'
import AppTemplate from './pages/App'
import type { BuildManifest } from '../types'
;(async () => {
    const ROOT_NODE = '#__pleb'
    // @ts-ignore
    const modules = import.meta.glob('./buildManifest.json')
    const buildManifest: BuildManifest = (
        await modules['./buildManifest.json']()
    ).default
    const slug = document.location.pathname
    const pagePath = buildManifest.pages[slug]

    if (pagePath) {
        const Component = (
            await import(/* @vite-ignore */ `./${pagePath.script}`)
        ).default
        const App = (
            <AppTemplate>
                <Component />
            </AppTemplate>
        )

        const rootNode = document.querySelector(ROOT_NODE)

        if (rootNode) {
            // @ts-ignore
            if (import.meta.hot) {
                const root = createRoot(rootNode)
                root.render(App)
            } else {
                hydrateRoot(rootNode, App)
            }
        } else {
            console.error('Could not find root node', ROOT_NODE)
        }
    }
})()

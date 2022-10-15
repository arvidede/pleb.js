import path from 'path'
import { FC, lazy, ReactElement, Suspense } from 'react'
import {
    __clientBuildDir,
    __clientServerDir,
    __clientStaticDir,
} from '../constants'

interface Props {
    children?: ReactElement | ReactElement[]
    pagePath: string
}

const isSSR = typeof window === 'undefined'

const bundlePath = isSSR
    ? path.resolve(__clientServerDir, 'home.js')
    : 'home.js'

const routes = ['/', '/home'].reduce((routes, route) => {
    routes[route] = lazy(() => import(bundlePath))
    return routes
}, {} as Record<string, any>)

const App: FC<Props> = ({ pagePath }) => {
    const Component = routes[pagePath]
    return (
        <Suspense>
            <Component />
        </Suspense>
    )
}

export default App

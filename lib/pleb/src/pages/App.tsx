import path from 'path'
import { FC, lazy, ReactElement, Suspense } from 'react'
import { __clientBuildDir } from '../constants'

interface Props {
    children?: ReactElement | ReactElement[]
    pagePath: string
}

const isSSR = typeof window === 'undefined'

const bundlePath = isSSR
    ? path.resolve(__clientBuildDir, 'index.mjs')
    : 'index.mjs'

const routes: Record<string, any> = {
    'index.tsx': lazy(() => import(bundlePath)),
    '/': lazy(() => import(bundlePath)),
}

const App: FC<Props> = ({ pagePath }) => {
    const Component = routes[pagePath]
    return (
        <Suspense>
            <Component />
        </Suspense>
    )
}

export default App

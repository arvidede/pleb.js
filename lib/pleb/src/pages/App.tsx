import { FC, lazy, ReactElement } from 'react'
import { __clientDir } from 'src/constants'

interface Props {
    children?: ReactElement | ReactElement[]
    pagePath: string
}

const routes: Record<string, any> = {
    'index.tsx': lazy(() => import(`${__clientDir}/.pleb/index.mjs`)),
    '/': lazy(() => import(`${__clientDir}/.pleb/index.mjs`)),
}

const App: FC<Props> = ({ children, pagePath }) => {
    const Component = routes[pagePath]
    return <Component />
}

export default App

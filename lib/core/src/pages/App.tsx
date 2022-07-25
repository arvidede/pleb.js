import { FC, ReactElement } from 'react'

interface Props {
    children: ReactElement | ReactElement[]
}

const App: FC<Props> = ({ children }) => {
    return <main>{children}</main>
}

export default App

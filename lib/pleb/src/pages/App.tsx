import { FC, ReactElement } from 'react'

interface Props {
    children: ReactElement | ReactElement[]
}

const App: FC<Props> = ({ children }) => {
    return <div>{children}</div>
}

export default App

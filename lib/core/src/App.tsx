import React from 'react'
import { FC, ReactElement } from 'react'
import Document from './Document'

interface Props {
    children: ReactElement | ReactElement[]
}

const App: FC<Props> = ({ children }) => {
    return <Document>{children}</Document>
}

export default App

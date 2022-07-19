import React from 'react'
import { FC, ReactElement } from 'react'

interface Props {
    children: ReactElement | ReactElement[]
}

const Document: FC<Props> = ({ children }) => {
    return (
        <html>
            <head></head>
            <body>{children}</body>
        </html>
    )
}

export default Document

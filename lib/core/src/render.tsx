import React from 'react'
import ReactDOM from 'react-dom/server'
import App from './App'

const ServerContext = (page: any) => {
    return <App>{page}</App>
}

export const renderPageToString = (page: any) => {
    return ReactDOM.renderToString(<ServerContext>{page}</ServerContext>)
}

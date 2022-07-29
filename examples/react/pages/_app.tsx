import React from 'react'
import '../styles/globals.css'
// import type { AppProps } from 'pleb/app'

interface AppProps {
    Component: any
    pageProps: any
}

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}

export default MyApp

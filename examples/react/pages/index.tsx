import React, { useState } from 'react'
import Header from '../components/Header'
import '../styles/globals.css'
// import type { NextPage } from 'pleb'

interface PlebPage {}

const Home: PlebPage = () => {
    const [count, setCount] = useState(0)
    return (
        <div>
            <Header />
            <button onClick={() => setCount((c) => c + 1)}>{count}</button>
        </div>
    )
}

export default Home

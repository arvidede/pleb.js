import { useState } from 'react'

export default () => {
    const [count, setCount] = useState(0)

    return <button onClick={() => setCount((c) => c + 1)}>{count}</button>
}

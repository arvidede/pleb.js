interface Props {}

const styles = {
    container: {
        width: '100%',
        backgroundColor: '#45CB85',
        padding: '2rem',
        color: '#fff',
    } as React.CSSProperties,
    nav: {
        display: 'flex',
    } as React.CSSProperties,
    navItems: {
        display: 'flex',
        columnGap: '2rem',
        margin: 0,
        padding: 0,
        listStyle: 'none',
    } as React.CSSProperties,
    navItem: {
        padding: 0,
    } as React.CSSProperties,
} as const

const Header = () => {
    return (
        <header style={styles.container}>
            <nav style={styles.nav}>
                <ul style={styles.navItems}>
                    <li style={styles.navItem}>Home</li>
                    <li style={styles.navItem}>About</li>
                    <li style={styles.navItem}>Blog</li>
                </ul>
            </nav>
        </header>
    )
}

export default Header

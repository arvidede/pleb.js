export const isIndexPage = (path: string) => {
    return /^index(\.(tsx|ts|js|jsx))?$/.test(path)
}

export const fileExtensionToHTML = (page: string) => {
    return page.replace(/(?<=\.)(js|jsx|ts|tsx)$/, 'html')
}

export const filePathToSlug = (path: string) => {
    if (isIndexPage(path)) return '/'
    return `/${path.replace(/\.(jsx|js|tsx|ts)/, '')}`
}

export const addFileExtensionToSlug = (slug: string) => {
    // TODO
}

export const pageBuildExtension = (page: string) =>
    page.replace(/(?<=\.)(js|jsx|ts|tsx)$/, 'html')

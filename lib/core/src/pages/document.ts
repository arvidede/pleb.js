const document = (children: string) => {
    return `
        <!DOCTYPE html>
        <html>
            <head></head>
            <body>${children}</body>
        </html>
    `
}

export default document

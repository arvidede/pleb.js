const document = (children: string, hydrate: () => void) => {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <script>
                    window.onload = ${hydrate.toString()}
                </script>
            </head>
            <body>
            <div id="__pleb">
                ${children}
            </div>
            </body>
            <script id="PLEB_DATA"></script>
        </html>
    `
}

export default document

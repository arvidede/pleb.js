export interface PageManifest {
    markup: string
    script: string
}

export interface BuildManifest {
    pages: Record<string, PageManifest>
}

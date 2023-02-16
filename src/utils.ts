export function getNotionIdsFromText(text: string): string[] | undefined {
    const regexValidNotionId = /[0-9a-f]{32}/gm;
    const url = new URL(text)
    const found = url.pathname.match(regexValidNotionId)
    return found || undefined
}

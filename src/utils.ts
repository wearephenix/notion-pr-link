export function getNotionIdsFromText(text: string): string[] | undefined {
    const regexNotionUrl =
        /(?:https?:\/\/)?(?:www\.)?notion\.so\/(?:[0-9a-zA-Z/\-?&=]+)/gm;
    const regexValidNotionId = /[0-9a-f]{32}/gm;

    const notionUrls = text.match(regexNotionUrl);
    const foundIds: string[] = []

    notionUrls?.forEach(url => {
        const _url = new URL(url);
        // @ts-ignore
        [_url.pathname, ..._url.searchParams.values()].forEach(item => {
            const found = (item || '').match(regexValidNotionId)
            if (found) foundIds.push(found[0])
        })
    });

    return foundIds.length > 0 ? foundIds : undefined;
}

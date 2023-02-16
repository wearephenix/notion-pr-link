export function getNotionIdsFromText(text: string): string[] | undefined {
    const regexNotionUrl =
        /(?:https?:\/\/)?(?:www\.)?notion\.so\/(?:[0-9a-zA-Z/\-?&=]+)/gm;
    const regexValidNotionId = /[0-9a-f]{32}/gm;

    const notionUrls = text.match(regexNotionUrl);

    const notionIds = notionUrls?.map(url => {
        const found = new URL(url).pathname.match(regexValidNotionId)
        return found ? found[0] : ''
    });

    return notionIds?.filter(s => s !== '');
}

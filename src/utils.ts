import * as core from '@actions/core';

export function getNotionIdsFromText(text: string): string[] | undefined {
    const regexNotionUrl =
        /(?:https?:\/\/)?(?:www\.)?notion\.so\/(?:[0-9a-zA-Z/\-?&=]+)/gm;
    const regexValidNotionId = /[0-9a-f]{32}/gm;


    const notionUrls = text.match(regexNotionUrl) || [];
    core.debug('Notion URLs found in the text: ' + notionUrls.join(', '));
    const foundIds: string[] = []

    for (const url of notionUrls) {
        const _url = new URL(url);
        for (const item of [_url.pathname, ..._url.searchParams.values()]) {
            const found = (item || '').match(regexValidNotionId)
            if (found) foundIds.push(found[0])
        }
    }

    core.debug('Notion IDs found in the text: ' + foundIds.join(', '))
    return foundIds.length > 0 ? foundIds : undefined;
}

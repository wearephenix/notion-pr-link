export function getNotionIdsFromText(text: string): string[] | undefined {
  const regexNotionUrl =
    /(?:https?:\/\/)?(?:www\.)?notion\.so\/(?:[0-9a-zA-Z/\-?&=]+)/gm;
  const regexValidNotionId = /[0-9a-f]{32}/gm;

  const notionUrls = text.match(regexNotionUrl);
    
  const notionIds = notionUrls?.map(url => (new URL(url)).pathname.match(regexValidNotionId));

  return notionIds?.map(n => n ? n[0] : undefined).filter(Boolean);
}

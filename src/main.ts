import * as core from '@actions/core';
import * as github from '@actions/github';
import { Client } from '@notionhq/client';
import { getNotionIdsFromText } from './utils';

async function run(): Promise<void> {
  try {
    const notionPropToUpdate: string = core.getInput('notion_prop');
    const notionSecret: string = core.getInput('notion_secret');
    const githubPrPayload = github?.context?.payload?.pull_request;

    core.debug(`[Debug] Github event payload: ${JSON.stringify(github?.context)}`);

    if (!githubPrPayload) {
      core.setFailed('Unable to resolve GitHub Pull Request payload.');
      return;
    }

    const { body: githubPrBody, html_url: githubPrUrl, number } = githubPrPayload;

    if (!githubPrBody) {
      core.info('Unable to get GitHub Pull Request body.');
      return;
    }

    if (!githubPrUrl) {
      core.setFailed('Unable to get GitHub Pull Request URL.');
      return;
    }

    const extractedPageIds = getNotionIdsFromText(githubPrBody);

    if (!extractedPageIds?.length) {
      core.info('No Notion tasks were found in your GitHub Pull Request.');
      return;
    }

    core.debug(
      `Extracted Notion page ids: ${JSON.stringify(extractedPageIds)}`
    );

    if (notionSecret === 'test') {
      core.info('This is a test. Skipping Notion API call.');
      return;
    }

    const notion = new Client({ auth: notionSecret });
    const updateNotionPageTasks = extractedPageIds.map(async pageId => {
      const response = await notion.pages.retrieve({ page_id: pageId });
      core.debug(`Retrieved Notion page: ${JSON.stringify(response)}`);
      if ('properties' in response) {
        if (response.properties[notionPropToUpdate].type === 'multi_select') {
          const listOfPr = [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...response.properties[notionPropToUpdate].multi_select,
            { name: githubPrUrl }
          ];
          const uniqueListOfPr = listOfPr.filter(
            (value, index, self) =>
              index === self.findIndex(v => v.name === value.name)
          );

          core.debug(`Unique list of PRs: ${JSON.stringify(uniqueListOfPr)}`);

          return notion.pages.update({
            page_id: pageId,
            properties: {
              [notionPropToUpdate]: {
                multi_select: uniqueListOfPr
              }
            }
          });
        }
        if (response.properties[notionPropToUpdate].type === 'rich_text') {
          const listOfPr = [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...response.properties[notionPropToUpdate].rich_text,
            {
              type: 'text',
              text: {
                content: `\nPull Request #${number}`,
                link: {
                  url: githubPrUrl
                }
              }
            }
          ];
          const uniqueListOfPr = listOfPr.filter(
            (value, index, self) =>
              index ===
              self.findIndex(v => v.text.content === value.text.content)
          );

          core.debug(`Unique list of PRs: ${JSON.stringify(uniqueListOfPr)}`);

          return notion.pages.update({
            page_id: pageId,
            properties: {
              [notionPropToUpdate]: {
                rich_text: uniqueListOfPr
              }
            }
          });
        }
      }

      return notion.pages.update({
        page_id: pageId,
        properties: {
          [notionPropToUpdate]: {
            url: githubPrUrl
          }
        }
      });
    });

    await Promise.all(updateNotionPageTasks);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();

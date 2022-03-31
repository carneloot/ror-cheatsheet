import 'dotenv/config';

import { connect } from 'puppeteer';
import { writeFileSync } from 'fs';

import { ItemLink } from './types/ItemLink';
import { scrapeItem } from './utils/scrapeItem';
import { PromisePool } from '@supercharge/promise-pool';

const ITEMS_PAGE = 'https://riskofrain2.fandom.com/wiki/Items';
const CONCURRENT_LIMIT = 15;

(async function () {
    const browser = await connect({
        browserWSEndpoint: process.env.HEADLESS_URL,
    });

    const page = await browser.newPage();

    await page.goto(ITEMS_PAGE);

    const itemLinks = await page.evaluate(() => {
        const table = document.querySelector<HTMLTableElement>('.thumb.tright.thumbinner > table');
        if (!table) {
            return [];
        }

        const itemAnchors = table.querySelectorAll<HTMLAnchorElement>('td > span > a');
        return Array.from(itemAnchors).map((anchor, index) => ({
            index,
            name: anchor.title,
            url: anchor.href,
        } as ItemLink));
    });

    await page.close();

    console.log(`Found ${itemLinks.length} items`);

    const { results: items } = await PromisePool
        .for(itemLinks)
        .withConcurrency(CONCURRENT_LIMIT)
        .process((itemLink) => scrapeItem(browser, itemLink));

    await browser.close();

    const data = {
        items,
    };

    console.log('Writing data.json file...');

    writeFileSync('./data.json', JSON.stringify(data, null, 4));

})();

import { Browser } from 'puppeteer';

import { UnlockInfo } from '../types/UnlockInfo';

export const scrapeItemUnlock = async (browser: Browser, url: string): Promise<UnlockInfo> => {
    const page = await browser.newPage();
    await page.goto(url);

    const unlockInfo = await page.evaluate((innerUrl) => {
        const infobox = document.querySelector<HTMLTableElement>('table.infoboxtable');

        if (!infobox) {
            throw new Error('Infobox table missing');
        }

        return {
            name: infobox.querySelector<HTMLDivElement>('.infoboxname')?.innerText?.trim(),
            description: infobox.querySelector<HTMLTableCellElement>('.infoboxdesc')?.innerText?.trim(),
            url: innerUrl,
        } as UnlockInfo;
    }, url);

    await page.close();

    return unlockInfo;
};

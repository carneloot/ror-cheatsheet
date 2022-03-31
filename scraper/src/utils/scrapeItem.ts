import { Browser } from 'puppeteer';

import { ItemLink } from '../types/ItemLink';
import { Item } from '../types/Item';
import { Stat } from '../types/Stat';

import { Rarity } from '../enum/Rarity';
import { Category } from '../enum/Category';
import { StatStack } from '../enum/StatStack';

import { consoleDump } from './consoleDump';
import { scrapeItemUnlock } from './scrapeItemUnlock';

const allCategories = Object.values(Category) as string[];

export const scrapeItem = async (browser: Browser, { index, name, url }: ItemLink): Promise<Item> => {
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(1000);

    page.on('console', consoleDump);

    const item = await page.evaluate((allCategories, innerName) => {
        const infobox = document.querySelector<HTMLTableElement>('table.infoboxtable');
        if (!infobox) {
            throw new Error('Infobox table missing');
        }

        const retrieveStats = () => {
            // Stats calculation
            const statsTitle = Array
                .from(infobox.querySelectorAll<HTMLTableCellElement>('.infoboxname'))
                .find(({ innerText }) => innerText.includes('Stats'));

            const statsTableHeaders = statsTitle?.parentElement?.nextElementSibling as HTMLTableRowElement | undefined;

            const stats: Stat[] = [];

            let nextStatRow = statsTableHeaders?.nextElementSibling as HTMLTableRowElement | undefined;
            while (nextStatRow) {
                const [
                    nameTd,
                    valueTd,
                    stackTd,
                    stackValueTd,
                ] = Array.from(nextStatRow.querySelectorAll<HTMLTableCellElement>('td'));

                const stack = (stackTd.querySelector('a')?.textContent?.toLowerCase() ?? 'linear') as StatStack;

                stats.push({
                    name: nameTd.innerText,
                    value: valueTd.innerText,
                    stack,
                    stackValue: stackValueTd.innerText,
                });

                nextStatRow = nextStatRow.nextElementSibling as HTMLTableRowElement;
            }

            return stats;
        };

        const findTdFromLabel = (label: string): HTMLTableCellElement | null => {
            const tdLabel = Array
                .from(infobox.querySelectorAll<HTMLTableCellElement>('td'))
                .find(({ innerText }) => innerText.includes(label));

            return (tdLabel?.nextElementSibling as HTMLTableCellElement) ?? null;
        };

        const rarityTd = findTdFromLabel('Rarity');
        const categoryTd = findTdFromLabel('Category');
        const unlockTd = findTdFromLabel('Unlock');

        let categories: Category[] = [];
        const possibleCategories = categoryTd?.innerText.toLowerCase().split('\n') ?? [];
        for (const possibleCategory of possibleCategories) {
            if (!allCategories.includes(possibleCategory)) {
                console.warn(`(${innerName}) Unknown category: "${possibleCategory}"`);
                continue;
            }

            categories.push(possibleCategory as Category);
        }

        return {
            name: infobox.querySelector<HTMLDivElement>('.infoboxname > div + div')?.innerText,
            imageSrc: infobox.querySelector<HTMLImageElement>('td > img')?.src,
            caption: infobox.querySelector<HTMLTableCellElement>('.infoboxcaption')?.innerText,
            description: infobox.querySelector<HTMLTableCellElement>('.infoboxdesc')?.innerText,
            rarity: rarityTd?.innerText.toLowerCase() as Rarity,
            categories,
            stats: retrieveStats(),
            unlock: unlockTd
                ? { url: unlockTd.querySelector('a')?.href }
                : undefined,
        } as Item;
    }, allCategories, name);

    await page.close();

    if (item.unlock) {
        item.unlock = await scrapeItemUnlock(browser, item.unlock.url);
    }

    return {
        ...item,
        id: index,
        wikiUrl: url,
    };
};

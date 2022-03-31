import { Rarity } from '../enum/Rarity';
import { Category } from '../enum/Category';

import { UnlockInfo } from './UnlockInfo';
import { Stat } from './Stat';

export type Item = {
    id: number;
    wikiUrl: string;
    name: string;
    imageSrc: string;
    caption: string;
    description: string;
    rarity: Rarity;
    categories: Category[];
    stats: Stat[];
    unlock?: UnlockInfo;
};

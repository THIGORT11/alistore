import rawStore from './store.json';
import { storeSchema } from './schema';
import { assertUnique } from './validation';

export const storeConfig = storeSchema.parse(rawStore);

assertUnique(storeConfig.loyalty.levels.map((level) => level.id), 'IDs de nivel de fidelidad');
assertUnique(storeConfig.footer.socialLinks.map((link) => link.id), 'IDs de red social');

export const loyaltyLevels = [...storeConfig.loyalty.levels]
  .sort((a, b) => a.sortOrder - b.sortOrder);

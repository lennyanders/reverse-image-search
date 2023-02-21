import { createSauceNaoMenuItem } from './menuActions/sauceNao';
import { createIqdbMenuItem } from './menuActions/iqdb';
import { createGoogleMenuItem } from './menuActions/google';
import { createTinEyeMenuItem } from './menuActions/tinEye';

chrome.contextMenus.removeAll();

const id = 'Search the web for image';

chrome.contextMenus.create({ id, title: id, contexts: ['image'] }, () => {
  createSauceNaoMenuItem(id);
  createIqdbMenuItem(id);
  createGoogleMenuItem(id);
  createTinEyeMenuItem(id);
});

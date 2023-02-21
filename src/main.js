import { createSauceNaoMenuItem } from './menuActions/sauceNao.js';
import { createIqdbMenuItem } from './menuActions/iqdb.js';
import { createGoogleMenuItem } from './menuActions/google.js';
import { createTinEyeMenuItem } from './menuActions/tinEye.js';

chrome.contextMenus.removeAll();

const id = 'Search the web for image';

chrome.contextMenus.create({ id, title: id, contexts: ['image'] }, () => {
  createSauceNaoMenuItem(id);
  createIqdbMenuItem(id);
  createGoogleMenuItem(id);
  createTinEyeMenuItem(id);
});

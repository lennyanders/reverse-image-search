import { createSauceNaoMenuItem } from './menuActions/sauceNao.js';
import { createIqdbMenuItem } from './menuActions/iqdb.js';
import { createGoogleMenuItem } from './menuActions/google.js';
import { createTinEyeMenuItem } from './menuActions/tinEye.js';

chrome.contextMenus.removeAll();

const id = '0';

chrome.contextMenus.create({ id, title: 'Search the web for image', contexts: ['image'] }, () => {
  createSauceNaoMenuItem(id);
  createIqdbMenuItem(id);
  createGoogleMenuItem(id);
  createTinEyeMenuItem(id);
});

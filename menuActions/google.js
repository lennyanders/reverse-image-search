import { isFile } from '../utils.js';

/** @param {string} parentId */
export const createGoogleMenuItem = (parentId) => {
  const id = 'Google';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScripts/google.js'],
      });
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
      chrome.tabs.create({
        index: index + 1,
        url: `https://images.google.de/searchbyimage?image_url=${srcUrl}`,
      });
    });
  });
};

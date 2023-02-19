import { isFile } from '../utils.js';

/** @param {string} parentId */
export const createIqdbMenuItem = (parentId) => {
  const id = 'iqdb';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScripts/iqdb.js'],
      });
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
      chrome.tabs.create({
        index: index + 1,
        url: `http://www.iqdb.org?url=${srcUrl}`,
      });
    });
  });
};

import { isFile } from '../utils.js';

export const createSauceNaoMenuItem = (parentId) => {
  chrome.contextMenus.create({
    parentId: parentId,
    title: 'sauceNAO',
    contexts: ['image'],
    onclick: ({ srcUrl }) => {
      if (isFile(srcUrl)) {
        chrome.tabs.executeScript({ file: 'contentScripts/sauceNao.js' });
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
        chrome.tabs.create({
          index: index + 1,
          url: `https://saucenao.com/search.php?url=${srcUrl}`,
        });
      });
    },
  });
};

import { isFile } from '../utils.js';

export const createIqdbMenuItem = (parentId) => {
  chrome.contextMenus.create({
    parentId: parentId,
    title: 'iqdb',
    contexts: ['image'],
    onclick: ({ srcUrl }) => {
      if (isFile(srcUrl)) {
        chrome.tabs.executeScript({ file: 'contentScripts/iqdb.js' });
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
        chrome.tabs.create({
          index: index + 1,
          url: `http://www.iqdb.org?url=${srcUrl}`,
        });
      });
    },
  });
};

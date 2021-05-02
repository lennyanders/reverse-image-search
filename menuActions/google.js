import { isFile } from '../utils.js';

export const createGoogleMenuItem = (parentId) => {
  chrome.contextMenus.create({
    parentId: parentId,
    title: 'Google',
    contexts: ['image'],
    onclick: ({ srcUrl }) => {
      if (isFile(srcUrl)) {
        chrome.tabs.executeScript({ file: 'contentScripts/google.js' });
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
        chrome.tabs.create({
          index: index + 1,
          url: `https://images.google.de/searchbyimage?image_url=${srcUrl}`,
        });
      });
    },
  });
};

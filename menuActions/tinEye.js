import { isFile } from '../utils.js';

const searchFileOnTinEye = ({ command, image, filename }) => {
  if (command !== 'search-on-tineye' || !image || !filename) return;

  chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
    chrome.tabs.create({ index: index + 1, url: 'https://tineye.com/' }, ({ id }) => {
      chrome.scripting.executeScript({
        target: { tabId: id },
        injectImmediately: true,
        args: [image, filename],
        func: async (image, filename) => {
          const lol = async () => {
            const input = document.getElementById('upload_box');
            if (!input) return false;

            const imageBuffer = await fetch(image).then((result) => result.arrayBuffer());
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([imageBuffer], filename, { type: 'image/jpeg' }));

            input.files = dataTransfer.files;
            input.dispatchEvent(new InputEvent('change'));
            return true;
          };

          if (await lol()) return;

          const observer = new MutationObserver(async () => (await lol()) && observer.disconnect());
          observer.observe(document.documentElement, { childList: true, subtree: true });
        },
      });
    });
  });
  chrome.runtime.onMessage.removeListener(searchFileOnTinEye);
};

export const createTinEyeMenuItem = (parentId) => {
  const id = 'TinEye';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      chrome.runtime.onMessage.addListener(searchFileOnTinEye);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScripts/tinEye.js'],
      });
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
      chrome.tabs.create({
        index: index + 1,
        url: `https://tineye.com/search?url=${srcUrl}`,
      });
    });
  });
};

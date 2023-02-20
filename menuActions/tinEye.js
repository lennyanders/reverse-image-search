import { isFile } from '../utils.js';

/**
 * @param {string} image
 * @param {string} filename
 */
const searchFileOnTinEyeContentScript = async (image, filename) => {
  const upload = async () => {
    /** @type {HTMLInputElement} */
    const input = document.querySelector('#upload_box');
    if (!input) return false;

    const imageBuffer = await fetch(image).then((result) => result.arrayBuffer());
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([imageBuffer], filename, { type: 'image/jpeg' }));

    input.files = dataTransfer.files;
    input.dispatchEvent(new InputEvent('change'));
    return true;
  };

  if (await upload()) return;

  /** @type {MutationObserver} */
  const observer = new MutationObserver(async () => (await upload()) && observer.disconnect());
  observer.observe(document.documentElement, { childList: true, subtree: true });
};

/** @param {{ command: string; image: string; filename: string }} p1 */
const searchFileOnTinEye = ({ command, image, filename }) => {
  if (command !== 'search-on-tineye' || !image || !filename) return;

  chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
    chrome.tabs.create({ index: index + 1, url: 'https://tineye.com/' }, ({ id }) => {
      chrome.scripting.executeScript({
        target: { tabId: id },
        injectImmediately: true,
        args: [image, filename],
        // @ts-ignore
        func: searchFileOnTinEyeContentScript,
      });
    });
  });
  // @ts-ignore
  chrome.runtime.onMessage.removeListener(searchFileOnTinEye);
};

/** @param {string} parentId */
export const createTinEyeMenuItem = (parentId) => {
  const id = 'TinEye';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      // @ts-ignore
      chrome.runtime.onMessage.addListener(searchFileOnTinEye);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const image = document.querySelector('img');
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          context.drawImage(image, 0, 0);

          chrome.runtime.sendMessage({
            command: 'search-on-tineye',
            image: canvas.toDataURL('image/jpeg', 1),
            filename: image.src.split(' / ').pop(),
          });
        },
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

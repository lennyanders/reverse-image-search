import { isFile } from '../utils.js';

const searchFileOnTinEye = ({ command, image, filename }) => {
  if (command !== 'search-on-tineye' || !image || !filename) return;

  chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
    chrome.tabs.create(
      {
        index: index + 1,
        url: 'https://tineye.com/',
      },
      ({ id }) => {
        chrome.tabs.executeScript(id, {
          code: `
            const observer = new MutationObserver(async () => {
              const input = document.getElementById('upload_box');
              if (!input) return;

              observer.disconnect();

              const imageBuffer = await fetch('${image}').then((result) => result.arrayBuffer());
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(new File([imageBuffer], '${filename}', {
                type: 'image/jpeg',
              }));

              input.files = dataTransfer.files;
              input.dispatchEvent(new InputEvent('change'));
            });

            observer.observe(document.body, { childList: true, subtree: true });
          `,
        });
      },
    );
  });
  chrome.runtime.onMessage.removeListener(searchFileOnTinEye);
};

export const createTinEyeMenuItem = (parentId) => {
  chrome.contextMenus.create({
    parentId: parentId,
    title: 'TinEye',
    contexts: ['image'],
    onclick: ({ srcUrl }) => {
      if (isFile(srcUrl)) {
        chrome.runtime.onMessage.addListener(searchFileOnTinEye);
        chrome.tabs.executeScript({ file: 'contentScripts/tinEye.js' });
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
        chrome.tabs.create({
          index: index + 1,
          url: `https://tineye.com/search?url=${srcUrl}`,
        });
      });
    },
  });
};

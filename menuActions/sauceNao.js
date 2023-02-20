import { isFile } from '../utils.js';

/** @param {string} parentId */
export const createSauceNaoMenuItem = (parentId) => {
  const id = 'sauceNAO';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          const image = document.querySelector('img');
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          context.drawImage(image, 0, 0);

          const type = 'image/jpeg';
          const imageResponse = await fetch(canvas.toDataURL(type, 1));
          const imageBuffer = await imageResponse.arrayBuffer();

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(new File([imageBuffer], image.src.split('/').pop(), { type }));

          const form = document.createElement('form');
          form.action = 'https://saucenao.com/search.php';
          form.method = 'POST';
          form.enctype = 'multipart/form-data';
          form.target = '_blank';
          form.style.display = 'none';

          const input = document.createElement('input');
          input.type = 'file';
          input.name = 'file';
          input.files = dataTransfer.files;

          form.append(input);
          document.body.append(form);
          form.submit();
        },
      });
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([{ index }]) => {
      chrome.tabs.create({
        index: index + 1,
        url: `https://saucenao.com/search.php?url=${srcUrl}`,
      });
    });
  });
};

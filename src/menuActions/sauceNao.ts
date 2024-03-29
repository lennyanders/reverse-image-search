import { isFile, searchOnlineImage } from '../shared';

export const createSauceNaoMenuItem = (parentId: string) => {
  const id = 'sauceNAO';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(async ({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          const image = document.querySelector('img');

          const maxSize = 3840;
          const divider = Math.ceil(Math.max(image.naturalWidth, image.naturalHeight) / maxSize);
          const width = Math.floor(image.naturalWidth / divider);
          const height = Math.floor(image.naturalHeight / divider);

          const canvas = new OffscreenCanvas(width, height);
          canvas.getContext('2d').drawImage(image, 0, 0, width, height);
          const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.5 });

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(new File([blob], image.src.split('/').pop()));

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

    searchOnlineImage('https://saucenao.com/search.php', srcUrl);
  });
};

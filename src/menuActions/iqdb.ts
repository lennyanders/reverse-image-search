import { getActiveTab, isFile } from '../shared';

export const createIqdbMenuItem = (parentId: string) => {
  const id = 'iqdb';

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
          form.action = 'https://www.iqdb.org/';
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

    const activeTab = await getActiveTab();
    const url = new URL('http://www.iqdb.org');
    url.searchParams.set('url', srcUrl);
    chrome.tabs.create({ index: activeTab.index + 1, url: url.href });
  });
};

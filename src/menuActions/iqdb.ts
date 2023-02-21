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
    chrome.tabs.create({ index: activeTab.index + 1, url: `http://www.iqdb.org?url=${srcUrl}` });
  });
};

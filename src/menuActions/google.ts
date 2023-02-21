import { getActiveTab, isFile } from '../shared';

export const createGoogleMenuItem = (parentId: string) => {
  const id = 'Google';

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
          form.action = 'https://images.google.com/searchbyimage/upload';
          form.method = 'POST';
          form.enctype = 'multipart/form-data';
          form.target = '_blank';
          form.style.display = 'none';

          const input = document.createElement('input');
          input.type = 'file';
          input.name = 'encoded_image';
          input.files = dataTransfer.files;

          form.append(input);
          document.body.append(form);
          form.submit();
        },
      });
      return;
    }

    const activeTab = await getActiveTab();
    const newTab = await chrome.tabs.create({
      index: activeTab.index + 1,
      url: `https://lens.google.com/uploadbyurl?url=${srcUrl}`,
    });

    const onloaded = (tabid: number) => {
      if (tabid !== newTab.id) return;

      chrome.tabs.onUpdated.removeListener(onloaded);
      chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        injectImmediately: true,
        func: () => {
          const updateUrl = () => {
            const anchor = document.querySelector<HTMLAnchorElement>(
              'a[href^="https://www.google.com/search?tbs"]',
            );
            if (anchor) location.href = anchor.href;
          };

          updateUrl();

          const observer = new MutationObserver(updateUrl);
          observer.observe(document.documentElement, { childList: true, subtree: true });
        },
      });
    };
    chrome.tabs.onUpdated.addListener(onloaded);
  });
};

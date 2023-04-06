import { isFile, searchOnlineImage } from '../shared';

const goToSourcesPage = (newTab: chrome.tabs.Tab) => {
  const onloaded = (
    tabid: number,
    changeInfo: Parameters<Parameters<typeof chrome.tabs.onUpdated.addListener>[0]>[1],
  ) => {
    if (tabid !== newTab.id || !changeInfo.url?.startsWith('https://lens.google.com/search')) {
      return;
    }

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
};

export const createGoogleMenuItem = (parentId: string) => {
  const id = 'Google';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(async ({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      const onCreated = (newTab: chrome.tabs.Tab) => {
        chrome.tabs.onCreated.removeListener(onCreated);
        goToSourcesPage(newTab);
      };
      chrome.tabs.onCreated.addListener(onCreated);
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
          form.action = 'https://lens.google.com/upload';
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

    goToSourcesPage(await searchOnlineImage('https://lens.google.com/uploadbyurl', srcUrl));
  });
};

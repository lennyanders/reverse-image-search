import { getActiveTab, isFile } from '../shared';

export const createTinEyeMenuItem = (parentId: string) => {
  const id = 'TinEye';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(async ({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      const [{ result }] = await chrome.scripting.executeScript({
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

          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        },
      });
      const activeTab = await getActiveTab();
      const newTab = await chrome.tabs.create({
        index: activeTab.index + 1,
        url: 'https://tineye.com/',
      });
      chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        injectImmediately: true,
        args: [result],
        // @ts-ignore
        func: async (image: string) => {
          const upload = async () => {
            const input = document.querySelector<HTMLInputElement>('#upload_box');
            if (!input) return false;

            const blob = await fetch(image).then((result) => result.blob());
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([blob], 'file', { type: 'image/jpeg' }));

            input.files = dataTransfer.files;
            input.dispatchEvent(new InputEvent('change'));
            return true;
          };

          if (await upload()) return;

          const observer: MutationObserver = new MutationObserver(
            async () => (await upload()) && observer.disconnect(),
          );
          observer.observe(document.documentElement, { childList: true, subtree: true });
        },
      });
      return;
    }

    const activeTab = await getActiveTab();
    const url = new URL('https://tineye.com/search');
    url.searchParams.set('url', srcUrl);
    chrome.tabs.create({ index: activeTab.index + 1, url: url.href });
  });
};

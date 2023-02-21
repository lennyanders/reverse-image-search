import { getActiveTab, isFile } from '../shared';

export const createTinEyeMenuItem = (parentId: string) => {
  const id = 'TinEye';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(async ({ menuItemId, srcUrl }, tab) => {
    if (menuItemId !== id) return;

    if (isFile(srcUrl)) {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const image = document.querySelector('img');
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          context.drawImage(image, 0, 0);

          return canvas.toDataURL('image/jpeg', 1);
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

            const imageBuffer = await fetch(image).then((result) => result.arrayBuffer());
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([imageBuffer], 'file', { type: 'image/jpeg' }));

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
    chrome.tabs.create({
      index: activeTab.index + 1,
      url: `https://tineye.com/search?url=${srcUrl}`,
    });
  });
};

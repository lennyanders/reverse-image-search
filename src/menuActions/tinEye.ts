import { getActiveTab, isFile } from '../shared';

const searchFileOnTinEyeContentScript = async (image: string, filename: string) => {
  const upload = async () => {
    const input = document.querySelector<HTMLInputElement>('#upload_box');
    if (!input) return false;

    const imageBuffer = await fetch(image).then((result) => result.arrayBuffer());
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([imageBuffer], filename, { type: 'image/jpeg' }));

    input.files = dataTransfer.files;
    input.dispatchEvent(new InputEvent('change'));
    return true;
  };

  if (await upload()) return;

  const observer: MutationObserver = new MutationObserver(
    async () => (await upload()) && observer.disconnect(),
  );
  observer.observe(document.documentElement, { childList: true, subtree: true });
};

const searchFileOnTinEye = ({
  command,
  image,
  filename,
}: {
  command: string;
  image: string;
  filename: string;
}) => {
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

export const createTinEyeMenuItem = (parentId: string) => {
  const id = 'TinEye';

  chrome.contextMenus.create({ parentId, id, title: id, contexts: ['image'] });

  chrome.contextMenus.onClicked.addListener(async ({ menuItemId, srcUrl }, tab) => {
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

    const activeTab = await getActiveTab();
    chrome.tabs.create({
      index: activeTab.index + 1,
      url: `https://tineye.com/search?url=${srcUrl}`,
    });
  });
};

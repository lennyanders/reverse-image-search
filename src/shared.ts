export const isFile = (url: string) => url.startsWith('file:///');

export const getActiveTab = async () => {
  return (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
};

export const isFile = (url: string) => url.startsWith('file:///');

export const getActiveTab = async () => {
  return (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
};

export const searchOnlineImage = async (siteUrl: string, imageUrl: string, parameter = 'url') => {
  const activeTab = await getActiveTab();
  const url = new URL(siteUrl);
  url.searchParams.set(parameter, imageUrl);
  return await chrome.tabs.create({ index: activeTab.index + 1, url: url.href });
};

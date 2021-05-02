(() => {
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
})();

(async () => {
  const image = document.querySelector('img');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);

  const imageBuffer = await fetch(
    canvas.toDataURL('image/jpeg', 1),
  ).then((result) => result.arrayBuffer());

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(
    new File([imageBuffer], image.src.split(' / ').pop(), {
      type: 'image/jpeg',
    }),
  );

  const form = document.createElement('form');
  form.action = 'http://www.iqdb.org/';
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
})();

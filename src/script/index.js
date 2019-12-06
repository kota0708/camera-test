const embedImageTag = dataURL => {
  const img = new Image();
  img.src = dataURL;
  img.width = '200';
  document.body.appendChild(img);
};

document.getElementById('js-file').addEventListener('change', e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    embedImageTag(reader.result);
  });
  reader.readAsDataURL(file);
});

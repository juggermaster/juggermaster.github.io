export const cleanTeamLogo = value => typeof value === 'string' && value.length <= 400000 && /^data:image\/(?:png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : '';

export async function importTeamLogo(file) {
  if (!file.size || file.size > 10 * 1024 * 1024 || file.type && !file.type.startsWith('image/')) throw Error('Invalid team logo');
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const image = new Image(); image.src = source;
  await image.decode();
  if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40000000) throw Error('Invalid image dimensions');
  const scale = Math.min(1, 256 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  const logo = cleanTeamLogo(canvas.toDataURL('image/webp', .85));
  if (!logo) throw Error('Team logo could not be reduced');
  return logo;
}

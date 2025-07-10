const apiUrl = 'https://ogn8u7wyp4.execute-api.us-east-1.amazonaws.com/Prod';

export async function uploadImages(evento: string, files: FileList) {
  const imagens: { base64: string; ext: string }[] = [];

  for (const file of Array.from(files)) {
    const base64 = await toBase64(file);
    imagens.push({ base64: base64.split(',')[1], ext: file.name.split('.').pop()! });
  }

  await fetch(`${apiUrl}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento, images: imagens }),
  });
}

export async function loadImages(evento: string): Promise<string[]> {
  const res = await fetch(`${apiUrl}/images?evento=${encodeURIComponent(evento)}`);
  return res.json();
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

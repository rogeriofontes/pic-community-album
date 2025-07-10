const apiUrl = 'https://ogn8u7wyp4.execute-api.us-east-1.amazonaws.com/Prod';

/*export async function uploadImages(evento: string, files: FileList) {
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
}*/
export async function uploadImages(evento: string, files: FileList) {
  const images = Array.from(files);

  const maxFileSize = 5 * 1024 * 1024; // 5MB

  for (const file of images) {
    if (file.size > maxFileSize) {
      alert(`A imagem ${file.name} é muito grande (máx. 5MB)`);
      continue;
    }

    const base64 = await toBase64(file);
    const ext = file.name.split('.').pop();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento,
        images: [{ base64, ext }],
      }),
    });

    if (!res.ok) {
      throw new Error('Falha ao enviar imagem: ' + file.name);
    }
  }
}

export async function loadImages(evento: string): Promise<string[]> {
  const res = await fetch(`${apiUrl}/images?evento=${encodeURIComponent(evento)}`);
  return res.json();
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    //reader.onload = () => resolve(reader.result as string);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // remove "data:image/..."
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

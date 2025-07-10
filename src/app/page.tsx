'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { uploadImages, loadImages } from '../app/utils/api';
import Image from 'next/image';

const Page = () => {
  const [evento, setEvento] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [imagens, setImagens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventoQuery = params.get('evento') || '';
    setEvento(eventoQuery);
    if (eventoQuery) {
      handleLoad(eventoQuery);
    }
  }, []);

  const handleUpload = async () => {
    if (!evento || !files) {
      alert('Informe o evento e selecione imagens.');
      return;
    }

    setIsLoading(true); // 👈 Inicia carregamento
    try {
      await uploadImages(evento, files);
      alert('Imagens enviadas!');
      handleLoad(evento);
    } catch {
      alert('Erro ao enviar imagens');
    } finally {
      setIsLoading(false); // 👈 Finaliza carregamento
    }
  };

  const handleLoad = async (evento: string) => {
    const urls = await loadImages(evento);

    // Ordena pela data extraída da URL (assumindo que o nome tem timestamp)
    const sorted = urls.sort((a, b) => {
      const getDateFromUrl = (url: string) => {
        const match = url.match(/(\d{4}-\d{2}-\d{2}T\d{6})/); // ex: 2025-07-08T180000
        return match ? new Date(match[1].replace('T', '').replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3')) : new Date(0);
      };
      return getDateFromUrl(b).getTime() - getDateFromUrl(a).getTime(); // mais recentes primeiro
    });

    setImagens(sorted);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Upload de Imagens</h1>
      <p>{evento ? `Evento selecionado: ${evento}` : 'Nenhum evento especificado'}</p>
      {isLoading && (
        <div style={styles.loader}>
          <Image src="/Loading_icon.gif" alt="Carregando..." width={48} height={48} />
          <p>Carregando imagens, por favor aguarde...</p>
        </div>
      )}

      <label htmlFor="upload" style={styles.uploadLabel}>
        📷 Selecionar imagens
      </label>

      <input
        id="upload" // precisa ser igual ao htmlFor
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {files && (
        <p style={styles.fileCount}>
          {files.length} {files.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
        </p>
      )}

      <button style={styles.button} onClick={handleUpload}>Enviar Imagens</button>

      {imagens.length > 0 && (
        <>
          <h2>Miniaturas</h2>
          <div style={styles.gallery}>
            {imagens.slice(-6).reverse().map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`Imagem ${index}`}
                width={120}
                height={80}
                style={{ borderRadius: '5px', objectFit: 'cover', width: '100%', height: 'auto' }}
              />
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href={`/album?evento=${evento}`} style={styles.link}>
              Ver álbum completo →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '2rem',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '10px',
    marginTop: '1rem',
  },
  image: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '5px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    marginTop: '1rem',
    padding: '0.75rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)', // degradê leve azul-claro
    border: '1px solid #81d4fa',
    color: '#000',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    transition: 'background 0.3s ease',
  },
  link: {
    display: 'inline-block',
    marginTop: '1rem',
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
  },
  loader: {
    marginTop: '1rem',
    padding: '1rem',
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    fontSize: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  uploadLabel: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)',
    border: '1px solid #81d4fa',
    color: '#333',
    cursor: 'pointer',
    textAlign: 'center',
    width: '96%',
  },
  fileCount: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    textAlign: 'center',
    color: '#555',
    fontStyle: 'italic',
  }


};

export default Page;
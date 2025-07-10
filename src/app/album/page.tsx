'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AlbumPage() {
    const [evento, setEvento] = useState('');
    const [imagens, setImagens] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const pageSize = 12;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const nomeEvento = params.get('evento');
        if (nomeEvento) {
            setEvento(nomeEvento);
            fetchImages(nomeEvento);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchImages = async (evento: string) => {
        try {
            const res = await fetch(`https://ogn8u7wyp4.execute-api.us-east-1.amazonaws.com/Prod/images?evento=${encodeURIComponent(evento)}`);
            const data = await res.json();

            // 🔽 Ordena por data embutida no nome da imagem
            const sorted = data.sort((a: string, b: string) => {
                const getDateFromUrl = (url: string) => {
                    const match = url.match(/(\d{4}-\d{2}-\d{2}T\d{6})/); // busca padrão: 2025-07-08T180000
                    if (!match) return new Date(0); // fallback
                    const dateStr = match[1].replace('T', '').replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3');
                    return new Date(dateStr);
                };

                return getDateFromUrl(b).getTime() - getDateFromUrl(a).getTime(); // mais recente primeiro
            });

            setImagens(sorted);
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(imagens.length / pageSize);
    const pageImages = imagens.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    if (!evento) {
        return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Evento não informado na URL.</p>;
    }

    return (
        <div style={styles.container}>
            <center><h1 style={styles.title}>📸 Álbum do Evento: {evento}</h1></center>
            {loading ? (
                <p>Carregando imagens...</p>
            ) : (
                <>
                    <div style={styles.gallery}>
                        {pageImages.map((url, i) => (
                            <div key={i} style={styles.imageWrapper} onClick={() => setSelectedImage(url)}>
                                <Image
                                    src={url}
                                    alt={`Imagem ${i}`}
                                    width={150}
                                    height={180}
                                    style={styles.image}
                                />
                            </div>
                        ))}
                    </div>

                    {selectedImage && (
                        <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
                            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <Image
                                    src={selectedImage}
                                    alt="Visualização"
                                    width={600}
                                    height={400}
                                    style={styles.modalImage}
                                />
                                <br />
                                <center>
                                    <button style={styles.closeButton} onClick={() => setSelectedImage(null)}>Fechar ✖</button>
                                </center>
                            </div>
                        </div>
                    )}

                    <div style={styles.pagination}>
                        <button style={styles.button} onClick={prevPage} disabled={currentPage === 1}>
                            ⬅ Página anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button style={styles.button} onClick={nextPage} disabled={currentPage === totalPages}>
                            Próxima página ➡
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    title: {
        textAlign: 'center',
        margin: '1rem 0',
        fontSize: '2rem',
        color: '#333',
    },

    container: {
        maxWidth: '900px',
        margin: 'auto',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)',
    },

    gallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px', // Espaço entre as fotos
        marginTop: '1rem',
    },

    image: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
        padding: '4px',
        border: '2px solid transparent', // Moldura fina
        background: `
            linear-gradient(#fff, #fff) padding-box,
            linear-gradient(135deg, #000, #444) border-box
        `,
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },

    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.5rem',
    },

    button: {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #4fc3f7, #81d4fa)', // azul claro degradê
        border: 'none',
        borderRadius: '8px',
        color: '#000',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
        margin: '0.5rem',
    },

    buttonHover: {
        background: 'linear-gradient(135deg, #29b6f6, #4fc3f7)',
        transform: 'scale(1.03)',
    },

    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },

    modalContent: {
        position: 'relative',
        maxWidth: '90%',
        maxHeight: '90%',
        padding: '1rem',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
    },

    modalImage: {
        maxWidth: '100%',
        maxHeight: '80vh',
        borderRadius: '6px',
    },

    closeButton: {
        marginTop: '1rem',
        background: '#1976d2',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
    }

};

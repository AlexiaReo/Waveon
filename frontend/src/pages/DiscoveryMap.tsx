// src/pages/DiscoveryMap.tsx
import React, { useMemo, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { Song } from '../types';

interface DiscoveryMapProps {
    songs: Song[];
    onGenreDiscovery: (genre: string, genreSongs: Song[]) => void;
    onBack: () => void;
}

export const DiscoveryMap: React.FC<DiscoveryMapProps> = ({ songs, onGenreDiscovery, onBack }) => {
    const imgCache = useRef(new Map<string, HTMLImageElement>());

    // 1. Create static stars
    const stars = useMemo(() => {
        return Array.from({ length: 400 }, () => ({
            x: (Math.random() - 0.5) * 3000,
            y: (Math.random() - 0.5) * 3000,
            size: Math.random() * 1.5,
            opacity: Math.random()
        }));
    }, []);

    const graphData = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];
        const seenArtists = new Set();
        const genres = Array.from(new Set(songs.map(s => s.genre)));

        // Bigger Genre Suns
        genres.forEach(genre => {
            nodes.push({ id: `genre-${genre}`, name: genre, val: 120, type: 'GENRE' });
        });

        // Bigger Artist Planets
        songs.forEach(song => {
            if (song.artist && !seenArtists.has(song.artist.id)) {
                seenArtists.add(song.artist.id);
                nodes.push({
                    id: `artist-${song.artist.id}`,
                    name: song.artist.name,
                    val: 40,
                    type: 'ARTIST',
                    genre: song.genre,
                    imgUrl: song.artist.imageUrl || song.imageUrl
                });
                links.push({ source: `genre-${song.genre}`, target: `artist-${song.artist.id}` });
            }
        });
        return { nodes, links };
    }, [songs]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, background: '#02040a' }}>
            {/* Navigation Button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute', top: '40px', left: '40px', zIndex: 2001,
                    background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                    padding: '12px 24px', borderRadius: '40px', cursor: 'pointer', backdropFilter: 'blur(15px)',
                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold'
                }}
            >
                <i className="pi pi-home"></i> Back to Home
            </button>

            <ForceGraph2D
                graphData={graphData}
                backgroundColor="#02040a"
                // This is the correct prop for drawing behind the graph
                onRenderFramePre={(ctx: CanvasRenderingContext2D, globalScale: number) => {
                    ctx.save();
                    stars.forEach(star => {
                        ctx.globalAlpha = star.opacity;
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, star.size / globalScale, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                    ctx.restore();
                }}
                onNodeClick={(node: any) => {
                    const genre = node.type === 'GENRE' ? node.name : node.genre;
                    onGenreDiscovery(genre, songs.filter(s => s.genre === genre));
                }}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    if (isNaN(node.x) || isNaN(node.y)) return;
                    const size = node.val / globalScale;

                    if (node.type === 'ARTIST' && node.imgUrl) {
                        let img = imgCache.current.get(node.imgUrl);
                        if (!img) { img = new Image(); img.src = node.imgUrl; imgCache.current.set(node.imgUrl, img); }

                        ctx.save();
                        // White glow for artist planets
                        ctx.shadowBlur = 20 / globalScale;
                        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                        ctx.clip();

                        if (img.complete) {
                            ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
                        } else {
                            ctx.fillStyle = '#1a1a1a';
                            ctx.fill();
                        }
                        ctx.restore();

                        // Artist Name
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Inter, sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.fillStyle = 'rgba(255,255,255,0.7)';
                        ctx.fillText(node.name, node.x, node.y + size + (10 / globalScale));
                    } else {
                        // GENRE SUN
                        try {
                            const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size);
                            grad.addColorStop(0, '#f15809');
                            grad.addColorStop(0.6, '#d14a05');
                            grad.addColorStop(1, 'rgba(0,0,0,0)');

                            ctx.fillStyle = grad;
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                            ctx.fill();

                            // Genre Label inside the Sun
                            const fontSize = 24 / globalScale;
                            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = 'white';
                            // Give text a dark shadow so it's readable on orange
                            ctx.shadowBlur = 5;
                            ctx.shadowColor = 'black';
                            ctx.fillText(node.name.toUpperCase(), node.x, node.y);
                        } catch (e) {
                            ctx.fillStyle = '#f15809';
                            ctx.fill();
                        }
                    }
                }}
            />
        </div>
    );
};
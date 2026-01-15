// src/pages/ExplorePage.tsx
import React from 'react';
import type { Song } from '../types';
import { MusicCard } from '../components/MusicCard';

interface ExplorePageProps {
    songs: Song[];
    handleSongSelect: (song: Song) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ songs, handleSongSelect }) => {
    // Reusing your gradients
    const cardGradients = [
        { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    ];

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Explore All Music</h2>
            <div className="card-grid">
                {songs.map((song, index) => (
                    <MusicCard
                        key={`explore-${song.id}`}
                        song={song}
                        onSongSelect={handleSongSelect}
                        gradientStyle={cardGradients[index % cardGradients.length]}
                    />
                ))}
            </div>
        </div>
    );
};
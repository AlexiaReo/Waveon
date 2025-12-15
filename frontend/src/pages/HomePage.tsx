// src/pages/HomePage.tsx
import React from 'react';
import type { Song } from '../types';
import { MusicCard } from '../components/MusicCard';

interface HomePageProps {
    songs?: Song[];
    filteredSongs?: Song[];
    handleSongSelect?: (song: Song) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ songs=[], filteredSongs=[], handleSongSelect = () => {}}) => {

    const cardGradients = [
        { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    ];

    return (
        <>
            {/* Recently Played / Featured Songs */}
            <section>
                <div className="section-header flex justify-between items-center mb-6">
                    <h2 className="text-2xl m-0 font-bold">Recommended Songs</h2>
                    <a href="#" className="see-all text-gray-300 text-sm font-medium hover:text-white transition-colors">See All</a>
                </div>
                <div className="card-grid">
                    {filteredSongs.slice(0, 15).map((song, index) => (
                        <MusicCard
                            key={song.id}
                            song={song}
                            onSongSelect={handleSongSelect}
                            gradientStyle={cardGradients[index % cardGradients.length]}
                        />
                    ))}
                </div>
            </section>

            {/* Additional Section (Top Pieces) */}
            <section>
                <div className="section-header flex justify-between items-center mb-6">
                    <h2 className="text-2xl m-0 font-bold">Top Songs</h2>
                    <a href="#" className="see-all text-gray-300 text-sm font-medium hover:text-white transition-colors">See All</a>
                </div>
                <div className="card-grid">
                    {songs.slice(6, 12).map((song, index) => (
                        <MusicCard
                            key={song.id}
                            song={song}
                            onSongSelect={handleSongSelect}
                            gradientStyle={cardGradients[index % cardGradients.length]}
                        />
                    ))}
                </div>
            </section>
        </>
    );
};
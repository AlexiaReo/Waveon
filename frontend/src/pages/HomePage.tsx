import React from 'react';
import type { Song } from '../types';
import { MusicCard } from '../components/MusicCard';

interface HomePageProps {
    songs?: Song[];
    filteredSongs?: Song[];
    handleSongSelect?: (song: Song) => void;
    onNavigate?: (view: any) => void;
    onToggleLike: (id: number) => void; // Define prop
    isSearching?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
                                                      songs=[],
                                                      filteredSongs=[],
                                                      handleSongSelect = () => {},
                                                      onNavigate = () => {},
                                                      isSearching = false,
                                                      onToggleLike // Destructure prop
                                                  }) => {

    const cardGradients = [
        { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    ];

    if (isSearching) {
        return (
            <section>
                <div className="section-header mb-6">
                    <h2 className="text-2xl m-0 font-bold">Search Results</h2>
                </div>
                <div className="card-grid">
                    {filteredSongs.map((song, index) => (
                        <MusicCard
                            key={`song-${song.id}`}
                            song={song}
                            onSongSelect={handleSongSelect}
                            gradientStyle={cardGradients[index % cardGradients.length]}
                            onToggleLike={onToggleLike} // <--- PASSED HERE
                        />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <>
            <section>
                <div className="section-header flex justify-between items-center mb-6">
                    <h2 className="text-2xl m-0 font-bold">Recommended Songs</h2>
                    <span onClick={() => onNavigate('explore')} className="see-all text-gray-300 text-sm font-medium hover:text-white transition-colors cursor-pointer">See All</span>
                </div>
                <div className="card-grid">
                    {filteredSongs.slice(0, 16).map((song, index) => (
                        <MusicCard
                            key={`song-${song.id}`}
                            song={song}
                            onSongSelect={handleSongSelect}
                            gradientStyle={cardGradients[index % cardGradients.length]}
                            onToggleLike={onToggleLike} // <--- PASSED HERE
                        />
                    ))}
                </div>
            </section>

            <section>
                <div className="section-header flex justify-between items-center mb-6">
                    <h2 className="text-2xl m-0 font-bold">Top Songs</h2>
                    <span onClick={() => onNavigate('favorites')} className="see-all text-gray-300 text-sm font-medium hover:text-white transition-colors cursor-pointer">See All</span>
                </div>
                <div className="card-grid">
                    {songs
                        .filter(song => song.isLiked) // Only Liked
                        .slice(0, 7)                  // Only First 7
                        .map((song, index) => (
                            <MusicCard
                                key={`top-song-${song.id}`}
                                song={song}
                                onSongSelect={handleSongSelect}
                                gradientStyle={cardGradients[index % cardGradients.length]}
                                onToggleLike={onToggleLike}
                            />
                        ))}
                </div>
            </section>
        </>
    );
};
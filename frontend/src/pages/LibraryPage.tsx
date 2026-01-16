// src/pages/LibraryPage.tsx
import React from 'react';
import type { UserLibrary } from '../types';
import PersonIcon from '@mui/icons-material/Person';

interface LibraryPageProps {
    library: UserLibrary | null;
    onPlaylistClick: (id: number) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ library, onPlaylistClick }) => {
    if (!library) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 font-semibold text-lg">Loading library...</div>
            </div>
        );
    }

    return (
        <div className="library-page p-6 text-white min-h-full">
            <h1 className="text-3xl font-bold mb-8">Your Library</h1>

            {/* Playlists Section */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-5">Playlists</h2>
                {library.playlists.length === 0 ? (
                    <p className="text-[#b3b3b3]">No playlists created yet.</p>
                ) : (
                    // ADDED '!grid' to force CSS Grid layout over PrimeFlex
                    <div className="!grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {library.playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-300 group"
                                onClick={() => onPlaylistClick(playlist.id)}
                            >
                                <div className="relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                                    <img
                                        src={playlist.imageUrl || '/default-playlist.png'}
                                        alt={playlist.title}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                    {/* Play Button on Hover */}
                                    <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-base truncate mb-1">{playlist.title}</h3>
                                <p className="text-sm text-[#b3b3b3] line-clamp-2">By You</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Followed Artists Section */}
            <section>
                <h2 className="text-2xl font-bold mb-5">Artists</h2>
                {library.followedArtists.length === 0 ? (
                    <p className="text-[#b3b3b3]">You haven't followed any artists yet.</p>
                ) : (
                    // ADDED '!grid' here as well
                    <div className="!grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {library.followedArtists.map((artist) => (
                            <div
                                key={artist.id}
                                className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer transition-all duration-300 group"
                            >
                                <div className="w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                                    {artist.imageUrl ? (
                                        <img
                                            src={artist.imageUrl}
                                            className="w-full h-full object-cover rounded-full"
                                            alt={artist.name}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#333] rounded-full flex items-center justify-center text-gray-400">
                                            <PersonIcon style={{ fontSize: 64 }} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-base truncate mb-1">{artist.name}</h3>
                                <p className="text-sm text-[#b3b3b3]">Artist</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
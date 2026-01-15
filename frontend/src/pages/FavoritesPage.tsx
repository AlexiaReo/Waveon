// src/pages/FavoritesPage.tsx
import React from 'react';
import type { Song } from '../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface FavoritesPageProps {
    songs: Song[];
    handleSongSelect: (song: Song) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ songs, handleSongSelect }) => {
    return (
        <div className="w-full h-full p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-6 pl-2">
                    Top Songs
                </h1>

                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="p-3 w-16 text-center">#</th>
                        <th className="p-3 w-16"></th>
                        <th className="p-3 font-medium text-left">Title</th>
                        <th className="p-3 w-16 text-center"><AccessTimeIcon style={{ fontSize: '16px' }}/></th>
                    </tr>
                    </thead>
                    <tbody>
                    {songs.map((song, index) => (
                        <tr
                            key={song.id}
                            className="group hover:bg-white/10 transition-colors cursor-pointer border-b border-transparent hover:border-transparent rounded-lg"
                            onClick={() => handleSongSelect(song)}
                        >
                            <td className="p-3 w-16 align-middle text-center text-gray-400 font-medium">
                                <span className="group-hover:hidden">{index + 1}</span>
                                <PlayArrowIcon className="hidden group-hover:inline-block text-white" fontSize="small" />
                            </td>

                            <td className="p-3 w-16 align-middle">
                                <img
                                    src={song.imageUrl || 'https://via.placeholder.com/40'}
                                    alt={song.name}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        minWidth: '48px',
                                        borderRadius: '4px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            </td>

                            <td className="p-3 align-middle">
                                <div className="flex flex-col justify-center">
                                        <span className="text-white font-medium text-base">
                                            {song.name}
                                        </span>

                                    <span className="text-gray-400 text-xs mt-1 block">
                                            {song.artist?.name || 'Unknown Artist'}
                                        </span>
                                </div>
                            </td>

                            <td className="p-3 text-center text-gray-400 text-sm font-variant-numeric tabular-nums w-16 align-middle rounded-r-md">
                                3:45
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
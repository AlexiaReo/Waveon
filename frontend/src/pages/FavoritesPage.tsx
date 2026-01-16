import React from 'react';
import type { Song } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface FavoritesPageProps {
    songs: Song[];
    handleSongSelect: (song: Song) => void;
    onToggleLike: (id: number) => void;
    onPlayAll: (songs: Song[]) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ songs, handleSongSelect, onToggleLike, onPlayAll }) => {
    return (
        <div className="w-full h-full p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-6 pl-2">
                    Liked Songs
                </h1>

                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={() => onPlayAll(songs)}
                        className="w-14 h-14 bg-[#f15809] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                    >
                        <PlayArrowIcon style={{fontSize: '32px', color: 'black'}}/>
                    </button>
                    <span className="text-gray-300 font-medium ml-2">{songs.length} songs</span>
                </div>

                <table className="w-full text-left border-separate border-spacing-y-1">
                    <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="p-3 w-16 text-center">#</th>
                        <th className="p-3 w-16"></th>
                        <th className="p-3 font-medium text-left">Title</th>
                        <th className="p-3 w-16 text-center">Like</th>
                    </tr>
                    </thead>
                    <tbody>
                    {songs.map((song, index) => (
                        <tr
                            key={song.id}
                            className="group hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => handleSongSelect(song)}
                        >
                            <td className="p-3 w-16 align-middle text-center text-gray-400 font-medium rounded-l-lg">
                                <span className="group-hover:hidden">{index + 1}</span>
                                <PlayArrowIcon className="hidden group-hover:inline-block text-white" fontSize="small"/>
                            </td>

                            <td className="p-3 w-16 align-middle">
                                <img
                                    src={song.imageUrl || 'https://via.placeholder.com/40'}
                                    alt={song.name}
                                    style={{width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover'}}
                                />
                            </td>

                            <td className="p-3 align-middle">
                                <div className="flex flex-col justify-center">
                                    <span className="text-white font-medium text-base">{song.name}</span>
                                    <span
                                        className="text-gray-400 text-xs mt-1 block">{song.artist?.name || 'Unknown Artist'}</span>
                                </div>
                            </td>

                            {/* THE LIKE BUTTON COLUMN */}
                            <td className="p-3 align-middle text-center">
                                <button
                                    className="text-gray-400 hover:text-white hover:scale-110 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleLike(song.id);
                                    }}
                                >
                                    {song.isLiked ? (
                                        <FavoriteIcon style={{color: '#acacac'}}/>
                                    ) : (
                                        <FavoriteBorderIcon/>
                                    )}
                                </button>
                            </td>

                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
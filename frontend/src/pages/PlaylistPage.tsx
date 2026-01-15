// src/pages/PlaylistPage.tsx
import React from 'react';
import type { Playlist, Song } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // ADDED Import
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface PlaylistPageProps {
    playlist: Playlist | undefined;
    onSongSelect: (song: Song) => void;
    onEdit: () => void;
    onDelete: () => void; // ADDED Prop
}

export const PlaylistPage: React.FC<PlaylistPageProps> = ({ playlist, onSongSelect, onEdit, onDelete }) => {
    if (!playlist) return <div className="p-8 text-white">Playlist not found</div>;

    const handleDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
            onDelete();
        }
    };

    return (
        <div className="playlist-page text-white bg-gradient-to-b from-[#2a2a2a] to-[#121212] min-h-full flex flex-col font-sans rounded-xl overflow-hidden">
            {/* --- Playlist Info Header --- */}
            <div className="flex flex-col md:flex-row gap-6 items-end p-6 bg-gradient-to-b from-transparent to-black/20">
                <img
                    src={playlist.imageUrl}
                    alt={playlist.title}
                    style={{ width: '192px', height: '192px', objectFit: 'cover' }}
                    className="shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md flex-shrink-0"
                />

                <div className="flex flex-col gap-2 w-full mb-1">
                    <span className="uppercase text-xs font-bold tracking-wider mt-2 md:mt-0">Playlist</span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white">{playlist.title}</h1>
                    <p className="text-[#b3b3b3] text-sm font-medium opacity-90">{playlist.description}</p>

                    <div className="flex items-center gap-1 text-xs md:text-sm font-bold mt-2">
                        <span>User</span>
                        <span className="text-white mx-1">•</span>
                        <span className="text-gray-300 font-medium">{playlist.songs.length} songs</span>
                    </div>
                </div>
            </div>

            {/* --- Action Bar --- */}
            <div className="px-6 py-4 bg-gradient-to-b from-black/10 to-[#121212] flex items-center gap-4">
                <button
                    className="bg-[#ff5e00] hover:bg-[#ff904f] text-black rounded-full p-3 shadow-lg transform transition hover:scale-105 flex items-center justify-center"
                    onClick={() => playlist.songs.length > 0 && onSongSelect(playlist.songs[0])}
                    title="Play"
                >
                    <PlayArrowIcon style={{ fontSize: 28 }} className="ml-0.5"/>
                </button>

                <button
                    className="text-[#b3b3b3] hover:text-white transition-colors p-2"
                    onClick={onEdit}
                    title="Edit Playlist"
                >
                    <EditIcon fontSize="large" />
                </button>

                {/* ADDED: Delete Button */}
                <button
                    className="text-[#b3b3b3] hover:text-red-500 transition-colors p-2"
                    onClick={handleDeleteClick}
                    title="Delete Playlist"
                >
                    <DeleteOutlineIcon fontSize="large" />
                </button>
            </div>

            {/* --- Songs List --- */}
            <div className="px-2 md:px-6 pb-8 bg-[#121212] flex-grow">
                {/* List Header */}
                <div className="!grid grid-cols-[auto_1fr] md:!grid-cols-[auto_4fr_3fr_minmax(60px,auto)] gap-4 text-[#b3b3b3] border-b border-[#ffffff1a] pb-2 mb-2 px-4 text-xs font-medium uppercase tracking-wider sticky top-0 bg-[#121212] z-10 pt-2 items-center">
                    <span className="w-6 text-center">#</span>
                    <span>Title</span>
                    <span className="hidden md:block">Artist</span>
                    <span className="hidden md:block text-right"><AccessTimeIcon style={{ fontSize: 16 }}/></span>
                </div>

                {/* Song Rows */}
                <div className="flex flex-col">
                    {playlist.songs.map((song, index) => (
                        <div
                            key={`playlist-song-${song.id}`}
                            className="group !grid grid-cols-[auto_1fr] md:!grid-cols-[auto_4fr_3fr_minmax(60px,auto)] gap-4 items-center px-4 py-2 rounded-md hover:bg-[#ffffff1a] cursor-pointer transition-colors"
                            onClick={() => onSongSelect(song)}
                        >
                            {/* 1. Index Column */}
                            <div className="flex justify-center items-center w-6 text-[#b3b3b3] text-sm font-variant-numeric">
                                <span className="group-hover:hidden">{index + 1}</span>
                                <span className="hidden group-hover:block text-white">
                                    <PlayArrowIcon style={{ fontSize: 14 }}/>
                                </span>
                            </div>

                            {/* 2. Title Column */}
                            <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                <img
                                    src={song.imageUrl}
                                    alt=""
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    className="rounded-[4px] shadow-sm flex-shrink-0 bg-[#333]"
                                />
                                <div className="flex flex-col truncate min-w-0">
                                    <span className="text-white text-sm font-normal truncate">{song.name}</span>
                                    <span className="md:hidden text-xs text-[#b3b3b3] hover:text-white truncate transition-colors">
                                        {song.artist.name}
                                    </span>
                                </div>
                            </div>

                            {/* 3. Artist Column (Desktop) */}
                            <div className="hidden md:flex items-center min-w-0">
                                <span className="text-[#b3b3b3] text-sm hover:text-white hover:underline truncate cursor-pointer transition-colors">
                                    {song.artist.name}
                                </span>
                            </div>

                            {/* 4. Duration Column (Static placeholder) */}
                            <div className="hidden md:flex justify-end text-[#b3b3b3] text-sm font-variant-numeric">
                                3:45
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
// src/pages/PlaylistFormPage.tsx
import React, { useState, useEffect } from 'react';
import type { Song } from '../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface PlaylistFormPageProps {
    songs: Song[];
    onSubmit: (data: { title: string; description: string; selectedSongIds: number[] }) => void;
    onCancel: () => void;
    initialValues?: {
        title: string;
        description: string;
        songs: Song[];
    };
}

export const PlaylistFormPage: React.FC<PlaylistFormPageProps> = ({ songs, onSubmit, onCancel, initialValues }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSongIds, setSelectedSongIds] = useState<Set<number>>(new Set());

    // Initialize form with values if provided (Edit Mode)
    useEffect(() => {
        if (initialValues) {
            setTitle(initialValues.title);
            setDescription(initialValues.description || '');
            const ids = new Set(initialValues.songs.map(s => s.id));
            setSelectedSongIds(ids);
        }
    }, [initialValues]);

    const toggleSong = (id: number) => {
        const newSelection = new Set(selectedSongIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedSongIds(newSelection);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({
            title,
            description,
            selectedSongIds: Array.from(selectedSongIds)
        });
    };

    const isEditing = !!initialValues;

    return (
        <div className="playlist-form-page p-8 text-white bg-gradient-to-b from-[#2a2a2a] to-[#121212] min-h-full rounded-xl flex flex-col font-sans">
            <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Playlist' : 'Create New Playlist'}</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
                {/* --- Input Fields --- */}
                <div className="flex flex-col gap-4 max-w-2xl">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-sm font-bold uppercase text-[#b3b3b3]">Name</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My Awesome Playlist"
                            className="bg-[#3e3e3e] border border-transparent focus:border-white rounded p-3 text-white outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-sm font-bold uppercase text-[#b3b3b3]">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Give your playlist a catchy description..."
                            className="bg-[#3e3e3e] border border-transparent focus:border-white rounded p-3 text-white outline-none transition-colors resize-none h-24"
                        />
                    </div>
                </div>

                <hr className="border-[#3e3e3e]" />

                {/* --- Song Selection --- */}
                <div className="flex flex-col gap-4 flex-grow">
                    <h2 className="text-xl font-bold">Manage Songs</h2>
                    <p className="text-[#b3b3b3] text-sm">Select songs to include in your playlist</p>

                    <div className="bg-[#181818] rounded-md border border-[#282828] overflow-hidden flex-grow max-h-[500px] overflow-y-auto">
                        {/* Header */}
                        <div className="!grid grid-cols-[50px_auto_1fr] md:!grid-cols-[50px_auto_4fr_3fr_minmax(60px,auto)] gap-4 px-4 py-2 border-b border-[#282828] text-[#b3b3b3] text-xs uppercase font-bold sticky top-0 bg-[#181818] z-10 items-center">
                            <span className="text-center">Select</span>
                            <span className="w-10"></span>
                            <span>Title</span>
                            <span className="hidden md:block">Artist</span>
                            <span className="hidden md:block text-right"><AccessTimeIcon style={{ fontSize: 16 }}/></span>
                        </div>

                        {/* List */}
                        {songs.map((song) => {
                            const isSelected = selectedSongIds.has(song.id);
                            return (
                                <div
                                    key={`form-song-${song.id}`}
                                    className={`!grid grid-cols-[50px_auto_1fr] md:!grid-cols-[50px_auto_4fr_3fr_minmax(60px,auto)] gap-4 items-center px-4 py-3 hover:bg-[#282828] cursor-pointer transition-colors border-b border-[#282828]/50 ${isSelected ? 'bg-[#ffffff1a]' : ''}`}
                                    onClick={() => toggleSong(song.id)}
                                >
                                    {/* Checkbox */}
                                    <div className="flex justify-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            className="w-5 h-5 accent-[#1db954] cursor-pointer"
                                        />
                                    </div>

                                    <img
                                        src={song.imageUrl}
                                        alt={song.name}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        className="rounded bg-[#333]"
                                    />

                                    <div className="flex flex-col truncate min-w-0">
                                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-[#1db954]' : 'text-white'}`}>{song.name}</span>
                                        <span className="md:hidden text-xs text-[#b3b3b3] truncate">{song.artist.name}</span>
                                    </div>

                                    <div className="hidden md:block text-[#b3b3b3] text-sm truncate">
                                        {song.artist.name}
                                    </div>

                                    <div className="hidden md:block text-[#b3b3b3] text-sm text-right font-variant-numeric">
                                        3:45
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Actions --- */}
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!title}
                        className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEditing ? 'Save Changes' : 'Create Playlist'}
                    </button>
                </div>
            </form>
        </div>
    );
};
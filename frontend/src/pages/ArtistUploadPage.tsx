// src/pages/ArtistUploadPage.tsx
import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import type { Artist } from '../types';
import { apiUrl } from "../config/api";

export const ArtistUploadPage: React.FC<{ onUpload: (data: FormData) => Promise<boolean> }> = ({ onUpload }) => {
    const [name, setName] = useState('');
    const [genre, setGenre] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isOwnArtist, setIsOwnArtist] = useState(true);
    const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);

    useEffect(() => {
        fetch(apiUrl('/artists'))
            .then(res => res.json())
            .then((data: Artist[]) => setArtists(data))
            .catch(err => console.error('Failed to fetch artists', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !coverImage) return;
        if (!isOwnArtist && !selectedArtistId) return;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('genre', genre);
        formData.append('image', coverImage);
        formData.append('file', file);
        if (!isOwnArtist && selectedArtistId) {
            formData.append('artistId', selectedArtistId.toString());
        }

        const success = await onUpload(formData);
        if (success) {
            // Just clear the form, AppLayout handles the visual notification
            setName('');
            setGenre('');
            setCoverImage(null);
            setFile(null);
            setIsOwnArtist(true);
            setSelectedArtistId(null);
        }
    };

    return (
        <div className="artist-upload-container p-8 bg-black/40 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Upload New Track</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
                <InputText placeholder="Song Name" value={name} onChange={(e) => setName(e.target.value)} />
                <InputText placeholder="Genre (e.g., POP, STUDY)" value={genre} onChange={(e) => setGenre(e.target.value)} />

                <div className="flex items-center gap-2">
                    <Checkbox inputId="isOwnArtist" checked={isOwnArtist} onChange={(e) => setIsOwnArtist(e.checked || false)} />
                    <label htmlFor="isOwnArtist" className="text-sm text-gray-400">Upload as my own artist</label>
                </div>

                {!isOwnArtist && (
                    <Dropdown
                        value={selectedArtistId}
                        onChange={(e) => setSelectedArtistId(e.value)}
                        options={artists.map(artist => ({ label: artist.name, value: artist.id }))}
                        placeholder="Select an artist"
                        className="w-full"
                    />
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                        className="text-white"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Audio File (.mp3)</label>
                    <input
                        type="file"
                        accept="audio/mpeg"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="text-white"
                    />
                </div>

                <button type="submit" className="cta-button">Publish Song</button>
            </form>
        </div>
    );
};

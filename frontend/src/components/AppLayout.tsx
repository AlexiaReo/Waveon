import React, { useState, useEffect, useRef } from "react";
import type { Song, Playlist, Artist } from '../types';

import { MainSidebar } from './MainSidebar';
import { TopToolbar } from './TopToolbar';
import { ArtistUploadPage } from "../pages/ArtistUploadPage.tsx";
import { PlayerBar } from "./PlayerBar.tsx";
import { LibraryPage } from '../pages/LibraryPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { PlaylistFormPage } from '../pages/PlaylistFormPage';
import { ExplorePage } from '../pages/ExplorePage';

// --- MERGED IMPORTS ---
import { ProfilePage } from './ProfilePage';        
import { ArtistPage } from '../pages/ArtistPage';   
import { FavoritesPage } from '../pages/FavoritesPage'; 
import { DiscoveryMap } from "../pages/DiscoveryMap.tsx"; // Galaxy of Music
// ----------------------

import { authFetch } from "../types/authFetch.ts";
import { Toast } from 'primereact/toast';
import { apiUrl } from "../config/api";
import './HomePage.css';

interface AppLayoutProps {
    children: React.ReactNode;
    userId?: number;
    onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, userId, onLogout }) => {
    const [search, setSearch] = useState<string>("");
    const toast = useRef<Toast>(null);

    const normalizeSongs = (data: any[]): Song[] => {
        return (data || [])
            .filter((s: any) => s.id != null)
            .sort((a: any, b: any) => Number(b.id) - Number(a.id));
    };

    const [currentView, setCurrentView] = useState<'home' | 'library' | 'explore' | 'favorites' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'artist-studio' | 'artist' | 'profile' | 'galaxy'>('home');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [currentFilteredSongs, setCurrentFilteredSongs] = useState<Song[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);

    const fetchPlaylists = () => {
        const token = sessionStorage.getItem("authToken");
        if (!userId || !token) return;
        authFetch(`${apiUrl}/playlists`).then(res => res.json()).then(setPlaylists);
    };

    useEffect(() => { fetchPlaylists(); }, [userId]);

    useEffect(() => {
        const fetchSongsAndLikes = async () => {
            try {
                const songsResponse = await fetch(`${apiUrl}/songs`);
                const allSongsData = await songsResponse.json();
                const validSongs = normalizeSongs(allSongsData);

                let likedSongIds = new Set<number>();
                if (userId) {
                    const likesResponse = await authFetch(`${apiUrl}/songs/like?userId=${userId}`);
                    if (likesResponse.ok) {
                        const likedSongsData: Song[] = await likesResponse.json();
                        likedSongsData.forEach(s => likedSongIds.add(s.id));
                    }
                }

                const mergedSongs = validSongs.map((s: Song) => ({
                    ...s,
                    isLiked: likedSongIds.has(s.id)
                }));

                setAllSongs(mergedSongs);
                setCurrentFilteredSongs(mergedSongs);
            } catch (err) { console.error(err); }
        };
        fetchSongsAndLikes();
    }, [userId]);

    const handleNavigate = (view: any) => {
        setCurrentView(view);
        setActivePlaylistId(null);
        if (view === 'home') setCurrentFilteredSongs(allSongs);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'library': return <LibraryPage playlists={playlists} onNavigate={handleNavigate} />;
            case 'explore': return <ExplorePage />;
            case 'favorites': return <FavoritesPage songs={allSongs.filter(s => s.isLiked)} onPlay={setCurrentSong} />;
            case 'artist': return <ArtistPage artistId={selectedArtistId} onPlay={setCurrentSong} />;
            case 'profile': return <ProfilePage userId={userId!} />;
            case 'galaxy': return <DiscoveryMap songs={allSongs} onPlay={setCurrentSong} />;
            default:
                return (
                    <div className="home-song-list">
                        {currentFilteredSongs.map(song => (
                            <div key={song.id} className="song-item" onClick={() => setCurrentSong(song)}>
                                <h4>{song.name}</h4>
                                <p>{song.artist.name}</p>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="app-layout">
            <Toast ref={toast} />
            <TopToolbar onSearch={setSearch} onLogout={onLogout} onNavigate={handleNavigate} onOpenProfile={() => setCurrentView('profile')} />
            <div className="main-container">
                <MainSidebar onNavigate={handleNavigate} playlists={playlists} currentView={currentView} />
                <div className="content-area">{renderContent()}</div>
            </div>
            <PlayerBar currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} />
        </div>
    );
};
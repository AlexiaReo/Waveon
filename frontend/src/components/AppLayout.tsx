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

// --- ALL FEATURES INCLUDED ---
import { ProfilePage } from './ProfilePage';        
import { ArtistPage } from '../pages/ArtistPage';   
import { FavoritesPage } from '../pages/FavoritesPage'; 
import { DiscoveryMap } from "../pages/DiscoveryMap.tsx"; // Galaxy of Music logic
// -----------------------------

import { authFetch } from "../types/authFetch.ts";
import { Toast } from 'primereact/toast';
import { apiUrl } from "../config/api";
import './HomePage.css';

export const AppLayout: React.FC<{userId?: number, onLogout?: () => void}> = ({ userId, onLogout }) => {
    const [search, setSearch] = useState<string>("");
    const toast = useRef<Toast>(null);

    const normalizeSongs = (data: any[]): Song[] => {
        return (data || [])
            .filter((s: any) => s.id != null)
            .sort((a: any, b: any) => Number(b.id) - Number(a.id));
    };

    // View state including 'galaxy'
    const [currentView, setCurrentView] = useState<'home' | 'library' | 'explore' | 'favorites' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'artist-studio' | 'artist' | 'profile' | 'galaxy'>('home');
    
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);

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

                setAllSongs(validSongs.map(s => ({ ...s, isLiked: likedSongIds.has(s.id) })));
            } catch (err) { console.error(err); }
        };
        fetchSongsAndLikes();
    }, [userId]);

    const handleNavigate = (view: any) => { setCurrentView(view); };

    const renderContent = () => {
        switch (currentView) {
            case 'explore': return <ExplorePage />;
            case 'favorites': return <FavoritesPage songs={allSongs.filter(s => s.isLiked)} onPlay={setCurrentSong} />;
            case 'artist': return <ArtistPage artistId={selectedArtistId} onPlay={setCurrentSong} />;
            case 'profile': return <ProfilePage userId={userId!} />;
            case 'galaxy': return <DiscoveryMap songs={allSongs} onPlay={setCurrentSong} />; // Galaxy View
            case 'library': return <LibraryPage playlists={playlists} onNavigate={handleNavigate} />;
            default: return <div>Home View (Songs List)</div>;
        }
    };

    return (
        <div className="app-layout">
            <Toast ref={toast} />
            <TopToolbar onLogout={onLogout} onNavigate={handleNavigate} onOpenProfile={() => setCurrentView('profile')} />
            <div className="main-container">
                <MainSidebar onNavigate={handleNavigate} playlists={playlists} currentView={currentView} />
                <div className="content-area">{renderContent()}</div>
            </div>
            <PlayerBar currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} />
        </div>
    );
};
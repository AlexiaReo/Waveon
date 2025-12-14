// src/components/AppLayout.tsx

import React, { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import type { Song, Playlist, PageContentProps, UserLibrary } from '../types';
import { MainSidebar } from './MainSidebar';
import { TopToolbar } from './TopToolbar';
import { PlayerBar } from './Playerbar';
import { LibraryPage } from '../pages/LibraryPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { PlaylistFormPage } from '../pages/PlaylistFormPage';
import './HomaPage.css';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    // --- STATE MANAGEMENT ---
    const [visible, setVisible] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");

    // View Management
    const [currentView, setCurrentView] = useState<'home' | 'library' | 'explore' | 'playlist' | 'create-playlist' | 'edit-playlist'>('home');

    // Data States
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [userLibrary, setUserLibrary] = useState<UserLibrary | null>(null);

    // Player States
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [currentFilteredSongs, setCurrentFilteredSongs] = useState<Song[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<string>("0:00");
    const [duration, setDuration] = useState<string>("0:00");
    const [isShuffling, setIsShuffling] = useState<boolean>(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
    const [volume, setVolume] = useState<number>(0.7);
    const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // --- Data Fetching ---
    const fetchPlaylists = () => {
        fetch("http://localhost:8081/api/playlists")
            .then(res => res.json())
            .then(data => setPlaylists(data))
            .catch(err => console.error("Error fetching playlists:", err));
    };

    useEffect(() => {
        fetchPlaylists();
        fetch("http://localhost:8081/api/songs")
            .then(res => res.json())
            .then(data => {
                setAllSongs(data);
                setCurrentFilteredSongs(data);
                if (data.length > 0 && !currentSong) {
                    setCurrentSong(data[0]);
                }
            })
            .catch(err => console.error("Error fetching songs:", err));
    }, []);

    useEffect(() => {
        if (currentView === 'library') {
            fetch("http://localhost:8081/api/users/1/library")
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch library");
                    return res.json();
                })
                .then(data => setUserLibrary(data))
                .catch(err => console.error("Error fetching user library:", err));
        }
    }, [currentView]);

    // --- Audio Logic ---
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100 || 0);
            setCurrentTime(formatTime(current));
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(formatTime(audioRef.current.duration));
        }
    };

    const handleNextSong = useCallback(() => {
        if (!currentSong || currentFilteredSongs.length === 0) return;
        const currentIndex = currentFilteredSongs.findIndex(s => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % currentFilteredSongs.length;
        setCurrentSong(currentFilteredSongs[nextIndex]);
    }, [currentSong, currentFilteredSongs]);

    const handlePreviousSong = useCallback(() => {
        if (!currentSong || currentFilteredSongs.length === 0) return;
        const currentIndex = currentFilteredSongs.findIndex(s => s.id === currentSong.id);
        let previousIndex = currentIndex - 1;
        if (previousIndex < 0) {
            previousIndex = currentFilteredSongs.length - 1;
        }
        setCurrentSong(currentFilteredSongs[previousIndex]);
    }, [currentSong, currentFilteredSongs]);

    const handleSongEnded = () => {
        if (repeatMode === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            handleNextSong();
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const duration = audioRef.current.duration;
            if (!isFinite(duration) || duration <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = clickPosition * duration;
        }
    };

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            setVolume(Math.min(1, Math.max(0, clickPosition)));
        }
    };

    const toggleShuffle = () => setIsShuffling(prev => !prev);
    const toggleRepeat = () => setRepeatMode(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        if (currentView === 'home') {
            const filtered = allSongs.filter(song =>
                song.name.toLowerCase().includes(value.toLowerCase()) ||
                song.artist.name.toLowerCase().includes(value.toLowerCase())
            );
            setCurrentFilteredSongs(filtered);
        }
    };

    // --- Navigation Handlers ---
    const handleNavigate = (view: 'home' | 'library' | 'explore' | 'playlist' | 'create-playlist' | 'edit-playlist') => {
        setCurrentView(view);
        setActivePlaylistId(null);
        if (view === 'home') {
            setCurrentFilteredSongs(allSongs);
        }
    };

    const handlePlaylistClick = (playlistId: number) => {
        setActivePlaylistId(playlistId);
        setCurrentView('playlist');

        const selectedPlaylist = playlists.find(p => p.id === playlistId);

        if (selectedPlaylist && selectedPlaylist.songs) {
            setCurrentFilteredSongs(selectedPlaylist.songs);
        } else {
            setCurrentFilteredSongs([]);
        }
    };

    const handleOpenCreatePlaylist = () => {
        setCurrentView('create-playlist');
        setActivePlaylistId(null);
    };

    // --- CREATE / EDIT / DELETE PLAYLIST LOGIC ---
    const handleSavePlaylist = async (data: { title: string, description: string, selectedSongIds: number[] }) => {
        const isEditing = currentView === 'edit-playlist' && activePlaylistId;

        const selectedSongs = data.selectedSongIds.map(id => ({ id }));

        const playlistData = {
            title: data.title,
            description: data.description || (isEditing ? "" : "Created via App"),
            visibility: "PUBLIC",
            imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
            user_id: { id: 1 },
            songs: selectedSongs
        };

        const url = isEditing
            ? `http://localhost:8081/api/playlists/${activePlaylistId}`
            : "http://localhost:8081/api/playlists";

        const method = isEditing ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(playlistData)
            });

            if (response.ok) {
                const savedPlaylist = await response.json();
                fetchPlaylists();
                handlePlaylistClick(savedPlaylist.id);
            } else {
                console.error("Failed to save playlist");
            }
        } catch (error) {
            console.error("Error saving playlist:", error);
        }
    };

    // ADDED: Delete Playlist Handler
    const handleDeletePlaylist = async () => {
        if (!activePlaylistId) return;

        try {
            const response = await fetch(`http://localhost:8081/api/playlists/${activePlaylistId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                // Update local state
                setPlaylists(prev => prev.filter(p => p.id !== activePlaylistId));
                // Navigate home
                handleNavigate('home');
            } else {
                console.error("Failed to delete playlist");
            }
        } catch (error) {
            console.error("Error deleting playlist:", error);
        }
    };

    // --- Effects for Audio ---
    useEffect(() => {
        if (audioRef.current && currentSong) {
            audioRef.current.src = `http://localhost:8081/api/songs/${currentSong.id}/stream`;
            audioRef.current.load();
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Play error:", e));
        }
    }, [currentSong]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.play().catch(e => console.error("Play error:", e));
            else audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    return (
        <div className="music-platform-wrapper flex min-h-screen">
            <MainSidebar
                visible={visible}
                setVisible={setVisible}
                playlists={playlists}
                onNavigate={handleNavigate as any}
                handlePlaylistClick={handlePlaylistClick}
                onCreatePlaylist={handleOpenCreatePlaylist}
                activePlaylistId={activePlaylistId}
                currentView={currentView}
            />

            <div className={`custom-main-content ${visible ? 'main-content-pushed' : 'main-content-full'}`} ref={mainContentRef}>
                <TopToolbar
                    search={search}
                    setSearch={setSearch}
                    handleSearchChange={handleSearchChange}
                    visible={visible}
                    setVisible={setVisible}
                />

                {/* --- Content Switching --- */}
                {currentView === 'library' ? (
                    <LibraryPage
                        library={userLibrary}
                        onPlaylistClick={handlePlaylistClick}
                    />
                ) : currentView === 'playlist' ? (
                    <PlaylistPage
                        playlist={playlists.find(p => p.id === activePlaylistId)}
                        onSongSelect={(song) => {
                            setCurrentSong(song);
                            setIsPlaying(true);
                        }}
                        onEdit={() => setCurrentView('edit-playlist')}
                        onDelete={handleDeletePlaylist} // ADDED: Pass delete handler
                    />
                ) : (currentView === 'create-playlist' || currentView === 'edit-playlist') ? (
                    <PlaylistFormPage
                        songs={allSongs}
                        onSubmit={handleSavePlaylist}
                        onCancel={() => {
                            if (activePlaylistId) handlePlaylistClick(activePlaylistId);
                            else handleNavigate('home');
                        }}
                        initialValues={
                            currentView === 'edit-playlist' && activePlaylistId
                                ? playlists.find(p => p.id === activePlaylistId)
                                : undefined
                        }
                    />
                ) : (
                    React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            const injectedProps: PageContentProps = {
                                songs: allSongs,
                                filteredSongs: currentFilteredSongs,
                                handleSongSelect: (song: Song) => {
                                    setCurrentSong(song);
                                    setIsPlaying(true);
                                    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                },
                            };
                            return React.cloneElement(child, injectedProps as any);
                        }
                        return child;
                    })
                )}
            </div>

            {currentSong && (
                <>
                    <PlayerBar
                        currentSong={currentSong}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        progress={progress}
                        currentTime={currentTime}
                        duration={duration}
                        volume={volume}
                        setVolume={setVolume}
                        isShuffling={isShuffling}
                        toggleShuffle={toggleShuffle}
                        repeatMode={repeatMode}
                        toggleRepeat={toggleRepeat}
                        handleSeek={handleSeek}
                        handleVolumeChange={handleVolumeChange}
                        handleNextSong={handleNextSong}
                        handlePreviousSong={handlePreviousSong}
                    />
                    <audio
                        ref={audioRef}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleSongEnded}
                    />
                </>
            )}
        </div>
    );
};
// src/components/AppLayout.tsx

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ChangeEvent } from "react";
import type { Song, Playlist, PageContentProps, UserLibrary } from '../types';
import { MainSidebar } from './MainSidebar';
import { TopToolbar } from './TopToolbar';
import {ArtistUploadPage} from "../pages/ArtistUploadPage.tsx";
import {PlayerBar} from "./Playerbar.tsx";
import { LibraryPage } from '../pages/LibraryPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { PlaylistFormPage } from '../pages/PlaylistFormPage';
import { ProfilePage } from './ProfilePage';
import './HomaPage.css';
import { authFetch} from "../types/authFetch.ts";
import {Toast} from "primereact/toast";
import {StudyModeOverlay} from "./StudyModeOverlay.tsx"; [StudyModeOverlay];
import { apiUrl } from "../config/api";


interface AppLayoutProps {
    children: React.ReactNode;
    userId?: number;
    onLogout?: () => void;

}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, userId, onLogout }) => {
    // --- STATE MANAGEMENT ---
    const [visible, setVisible] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const toast = useRef<Toast>(null);

    const normalizeSongs = (data: any[]): Song[] => {
        // Ensure we never render invalid entries, and show newest-first.
        // This matters because the Home page uses slices (e.g. `filteredSongs.slice(0, 16)`),
        // so newly uploaded songs must appear at the front.
        return (data || [])
            .filter((s: any) => s?.id != null)
            .sort((a: any, b: any) => Number(b.id) - Number(a.id));
    };

    // View Management
    const [currentView, setCurrentView] = useState<'home' | 'library' | 'explore' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'artist-studio' | 'profile'>('home');
    // Data States
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [userLibrary, setUserLibrary] = useState<UserLibrary | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

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
    const [isStudyOpen, setIsStudyOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const [studyState, setStudyState] = useState<{
        isActive: boolean;
        mode: 'STUDY' | 'BREAK';
        timeLeft: number;
        studyDuration: number;
        breakDuration: number;
    }>({
        isActive: false,
        mode: 'STUDY',
        timeLeft: 0,
        studyDuration: 0,
        breakDuration: 0
    });
    useEffect(() => {
        let timer: any;
        if (studyState.isActive && studyState.timeLeft > 0) {
            timer = setInterval(() => {
                setStudyState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
            }, 1000);
        } else if (studyState.isActive && studyState.timeLeft === 0) {
            // Switch Modes
            const newMode = studyState.mode === 'STUDY' ? 'BREAK' : 'STUDY';
            const newTime = newMode === 'STUDY' ? studyState.studyDuration : studyState.breakDuration;

            setStudyState(prev => ({ ...prev, mode: newMode, timeLeft: newTime }));
            handleStudySwitch(newMode);
        }
        return () => clearInterval(timer);
    }, [studyState]);

    // src/components/AppLayout.tsx

    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        const storedUserId = sessionStorage.getItem("userId");
        const targetId = userId || (storedUserId ? parseInt(storedUserId) : null);

        if (token && targetId) {
            authFetch(`/users/${targetId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch user");
                    return res.json();
                })
                .then(data => {
                    // Log the data to see exactly what the UserDTO contains
                    console.log("User Data Received:", data);

                    // Your backend returns a Set called 'roles' which becomes an array
                    if (data.roles && Array.isArray(data.roles)) {
                        // We look for the "ROLE_ARTIST" string inside that array
                        const isArtist = data.roles.includes("ROLE_ARTIST");

                        if (isArtist) {
                            setUserRole("ROLE_ARTIST");
                        } else {
                            setUserRole("ROLE_USER");
                        }
                    }
                })
                .catch(err => console.error("Error identifying user role:", err));
        }
    }, [userId]);

    const handleArtistUpload = async (formData: FormData) => {
        try {
            const token = sessionStorage.getItem("authToken");
            if (!token) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Not logged in',
                    detail: 'Please log in as an Artist to publish songs.',
                    life: 3500
                });
                return false;
            }
            const response = await fetch("http://localhost:8081/api/songs", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Content-Type is OMITTED here
                },
                body: formData
            });

            if (response.ok) {
                // Refresh global songs so the upload becomes visible immediately.
                try {
                    const songsRes = await fetch(apiUrl("/songs"));
                    if (songsRes.ok) {
                        const data = await songsRes.json();
                        const validSongs = normalizeSongs(data);
                        setAllSongs(validSongs);
                        // Keep the UI list fresh regardless of current view.
                        // (Otherwise you can upload from Artist Studio and not see it later until a reload.)
                        setCurrentFilteredSongs(validSongs);
                    }
                } catch {
                    // Non-fatal: upload succeeded, but refresh failed.
                }

                // TRIGGER THE TOAST SUCCESS
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Song published to WaveOn!',
                    life: 3000
                });
                return true;
            } else {
                // Spring often returns empty body for 401/403, so include status as a fallback.
                const errText = await response.text().catch(() => "");

                if (response.status === 401) {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Session expired',
                        detail: 'Please log in again, then retry publishing your song.',
                        life: 4500
                    });
                    return false;
                }

                if (response.status === 403) {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Artist-only action',
                        detail: 'Only Artists can publish songs. Go to Profile → “Become Artist”, then retry.',
                        life: 5500
                    });
                    return false;
                }

                // TRIGGER THE TOAST ERROR
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: errText
                        ? `Upload failed (${response.status}): ${errText}`
                        : `Upload failed (${response.status}).`,
                    life: 4000
                });
                return false;
            }
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Server Error',
                detail: 'Could not connect to server.',
                life: 4000
            });
            return false;
        }
    };

    const startStudyMode = (studyMin: number, breakMin: number) => {
        setStudyState({
            isActive: true,
            mode: 'STUDY',
            timeLeft: studyMin * 60,
            studyDuration: studyMin * 60,
            breakDuration: breakMin * 60
        });
        setIsStudyOpen(false);
        handleStudySwitch('STUDY');
        setIsPlaying(true);
    };
    const stopStudyMode = () => {
        setStudyState(prev => ({ ...prev, isActive: false }));
        handleStudySwitch('REGULAR');
    };

    const handleStudySwitch = (mode: 'STUDY' | 'BREAK' | 'REGULAR') => {
        const url = mode === 'STUDY'
            ? apiUrl("/songs/genre/STUDY")
            : apiUrl("/songs");

        fetch(url) // Public songs fetch
            .then(res => res.json())
            .then(data => {
                const validSongs = normalizeSongs(data);
                setCurrentFilteredSongs(validSongs);
                if (validSongs.length > 0) setCurrentSong(validSongs[0]);
            });
    };


    const fetchPlaylists = () => {
        const token = sessionStorage.getItem("authToken");
        if (!token) {
            console.warn("No token found, skipping playlist fetch.");
            setPlaylists([]); // Set to empty so the sidebar doesn't crash
            return;
        }

        authFetch("/playlists", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => setPlaylists(data))
            .catch(err => console.error("Error fetching playlists:", err));
    };
    useEffect(() => {
        // 1. Fetch Playlists (Will return empty/403 until logged in, which is fine)
        fetchPlaylists();

        // 2. Fetch Songs GLOBALLY (Using standard fetch)
        fetch(apiUrl("/songs"))
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch global songs");
                return res.json();
            })
            .then(data => {
                const validSongs = normalizeSongs(data);

                setAllSongs(validSongs);
                setCurrentFilteredSongs(validSongs);

                if (validSongs.length > 0 && !currentSong) {
                    setCurrentSong(validSongs[0]);
                }
            })
            .catch(err => console.error("Error fetching global songs:", err));
    }, []);

    useEffect(() => {
        if (currentView === 'library') {
            authFetch(`/users/${userId}/library`)
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
                (song.artist?.name ?? "").toLowerCase().includes(value.toLowerCase())
            );
            setCurrentFilteredSongs(filtered);
        }
    };

    // --- Navigation Handlers ---
    const handleNavigate = (view: 'home' | 'library' | 'explore' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'profile') => {
        setCurrentView(view);
        setActivePlaylistId(null);
        if (view === 'home') {
            setCurrentFilteredSongs(allSongs);
        }
    };

    const effectiveUserId = (() => {
        if (userId != null) return userId;
        const storedUserId = sessionStorage.getItem("userId");
        return storedUserId ? parseInt(storedUserId, 10) : undefined;
    })();

    const handleOpenProfile = () => {
        if (!effectiveUserId) {
            console.warn("No userId available; cannot open profile.");
            return;
        }
        setCurrentView('profile');
    };

    const handleLogout = () => {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userId");
        setUserRole(null);
        setUserLibrary(null);
        setPlaylists([]);
        setActivePlaylistId(null);
        setCurrentSong(null);
        setIsPlaying(false);
        setCurrentView('home');
        onLogout?.();
    };

    const handleBecomeArtist = async () => {
        if (!effectiveUserId) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Not logged in',
                detail: 'Please log in again.',
                life: 3000
            });
            return;
        }

        const token = sessionStorage.getItem("authToken");
        if (!token) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Missing token',
                detail: 'Please log in again.',
                life: 3000
            });
            return;
        }

        try {
            const res = await fetch(apiUrl(`/users/${effectiveUserId}/become-artist`), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`${res.status} ${res.statusText}${txt ? `: ${txt}` : ''}`);
            }

            const data: { token: string; userId: number } = await res.json();
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('userId', String(data.userId));
            setUserRole('ROLE_ARTIST');

            toast.current?.show({
                severity: 'success',
                summary: 'Upgraded',
                detail: 'Your account is now an Artist.',
                life: 3000
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to become an Artist';
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 4000
            });
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
            user_id: { id: userId },
            songs: selectedSongs
        };

        const url = isEditing
            ? apiUrl(`/playlists/${activePlaylistId}`)
            : apiUrl("/playlists");

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
            const response = await fetch(apiUrl(`/playlists/${activePlaylistId}`), {
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
        if (!audioRef.current || !currentSong?.id) {
            console.warn("Skipping audio load, invalid song:", currentSong);
            return;
        }

        audioRef.current.src =
            apiUrl(`/songs/${currentSong.id}/stream`);
        audioRef.current.load();

        if (isPlaying) {
            audioRef.current.play().catch(() => {});
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
            {/* Global notifications (used by Artist Upload + profile actions) */}
            <Toast ref={toast} position="top-right" />
            <MainSidebar
                visible={visible}
                setVisible={setVisible}
                playlists={playlists}
                onNavigate={handleNavigate as any}
                handlePlaylistClick={handlePlaylistClick}
                onCreatePlaylist={handleOpenCreatePlaylist}
                activePlaylistId={activePlaylistId}
                currentView={currentView}
                userId={userId}
                userRole={userRole}
            />

            <div className={`custom-main-content ${visible ? 'main-content-pushed' : 'main-content-full'}`} ref={mainContentRef}>
                <TopToolbar
                    search={search}
                    setSearch={setSearch}
                    handleSearchChange={handleSearchChange}
                    visible={visible}
                    setVisible={setVisible}
                    onStudyClick={() => setIsStudyOpen(true)}
                    studyState={studyState} // ADD THIS
                    onGiveUp={stopStudyMode}
                    onProfileClick={handleOpenProfile}
                />

                <StudyModeOverlay
                    isActive={isStudyOpen}
                    onClose={() => setIsStudyOpen(false)}
                    onActivate={startStudyMode}
                    isStudyActive={studyState.isActive}
                    timeLeft={studyState.timeLeft} // Pass missing props
                    mode={studyState.mode}         // Pass missing props
                    onGiveUp={stopStudyMode}
                />
                {studyState.isActive && (
                    <div style={{
                        position: 'fixed',
                        top: '0px', // Matches your toolbar height
                        left: 0,
                        right: 0,
                        bottom: '90px',
                        backgroundColor: '#000000',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <h1  style={{
                            fontSize: '12rem', // Massive timer
                            fontWeight: '800',
                            color: 'white',
                            margin: 0,
                            fontFamily: 'monospace' // Monospace prevents numbers from "jumping"
                        }}>
                            {Math.floor(studyState.timeLeft / 60)}:
                            {(studyState.timeLeft % 60).toString().padStart(2, '0')}
                        </h1>
                        <p style={{
                            color: '#aaa',
                            letterSpacing: '8px', // More spacing for a premium look
                            fontSize: '2.5rem',   // Bigger label
                            textTransform: 'uppercase',
                            marginTop: '20px'
                        }}>
                            {studyState.mode === 'STUDY' ? '📚 Focus Time 📚' : '✨ Break Time ✨'}
                        </p>
                    </div>
                )}
                {currentView === 'profile' ? (
                    <ProfilePage
                        userId={effectiveUserId as number}
                        viewerId={effectiveUserId as number}
                        onBack={() => setCurrentView('home')}
                        onOpenPlaylist={(playlistId: number) => handlePlaylistClick(playlistId)}
                        isArtist={userRole === 'ROLE_ARTIST'}
                        onBecomeArtist={handleBecomeArtist}
                        onLogout={handleLogout}
                    />
                ) : currentView === 'artist-studio' ? (
                    <ArtistUploadPage onUpload={handleArtistUpload} />
                ) :currentView === 'library' ? (
                    <LibraryPage
                        library={userLibrary}
                        onPlaylistClick={handlePlaylistClick}
                    />
                ) : (currentView === 'playlist' ? (
                    <PlaylistPage
                        playlist={playlists.find(p => p.id === activePlaylistId)}
                        onSongSelect={(song: Song) => {
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
                ))}
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

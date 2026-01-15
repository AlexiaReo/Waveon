// src/components/AppLayout.tsx

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ChangeEvent } from "react";
import type { Song, Playlist, Artist, UserLibrary } from '../types';
import { MainSidebar } from './MainSidebar';
import { TopToolbar } from './TopToolbar';
import {ArtistUploadPage} from "../pages/ArtistUploadPage.tsx";
import {PlayerBar} from "./Playerbar.tsx";
import { LibraryPage } from '../pages/LibraryPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { PlaylistFormPage } from '../pages/PlaylistFormPage';
import { ArtistPage } from '../pages/ArtistPage';
import { ProfilePage } from './ProfilePage';
import './HomaPage.css';
import { authFetch} from "../types/authFetch.ts";
import {Toast} from "primereact/toast";
import {StudyModeOverlay} from "./StudyModeOverlay.tsx"; [StudyModeOverlay];
import { ExplorePage } from '../pages/ExplorePage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { DiscoveryMap} from "../pages/DiscoveryMap.tsx";

interface AppLayoutProps {
    children: React.ReactNode;
    userId?: number;

}

export const AppLayout: React.FC<AppLayoutProps> = ({ children , userId}) => {
    // --- STATE MANAGEMENT ---
    const [visible, setVisible] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const toast = useRef<Toast>(null);


    // View Management
    const [currentView, setCurrentView] = useState<
        'home'
        | 'library'
        | 'explore'
        | 'favorites'
        | 'playlist'
        | 'create-playlist'
        | 'edit-playlist'
        | 'artist-studio'
        | 'artist'
        | 'galaxy'
        | 'profile'
    >('home');
    // Data States
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [userLibrary, setUserLibrary] = useState<UserLibrary | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Player States
    const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);
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
            authFetch(`http://localhost:8081/api/users/${targetId}`)
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
            const response = await fetch("http://localhost:8081/api/songs", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Content-Type is OMITTED here
                },
                body: formData
            });

            if (response.ok) {
                // ... your existing refresh logic ...

                // TRIGGER THE TOAST SUCCESS
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Song published to WaveOn!',
                    life: 3000
                });
                return true;
            } else {
                // TRIGGER THE TOAST ERROR
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Artist not found or upload failed.',
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
            ? "http://localhost:8081/api/songs/genre/STUDY"
            : "http://localhost:8081/api/songs";

        fetch(url) // Public songs fetch
            .then(res => res.json())
            .then(data => {
                const validSongs = data.filter((s: any) => s?.id != null);
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

        authFetch("http://localhost:8081/api/playlists", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => setPlaylists(data))
            .catch(err => console.error("Error fetching playlists:", err));
    };
    useEffect(() => {
        // 1. Fetch Playlists (Will return empty/403 until logged in, which is fine)
        fetchPlaylists();

        //for fetch liked songs also
        const fetchSongsAndLikes = async () => {
            try {
                // A. Fetch All Songs
                const songsResponse = await fetch("http://localhost:8081/api/songs");
                const allSongsData = await songsResponse.json();

                // B. Fetch Liked Songs (Only if user is logged in)
                let likedSongIds = new Set<number>();
                if (userId) {
                    const likesResponse = await authFetch(`http://localhost:8081/api/songs/like?userId=${userId}`);
                    if (likesResponse.ok) {
                        const likedSongsData: Song[] = await likesResponse.json();
                        // Create a Set of IDs for fast lookup
                        likedSongsData.forEach(s => likedSongIds.add(s.id));
                    }
                }

                // C. MERGE THEM: Add 'isLiked: true' if the song is in the liked list
                const mergedSongs = allSongsData
                    .filter((s: any) => s?.id != null)
                    .map((s: Song) => ({
                        ...s,
                        isLiked: likedSongIds.has(s.id) // <--- THIS IS THE MAGIC
                    }));

                setAllSongs(mergedSongs);
                setCurrentFilteredSongs(mergedSongs);

                if (mergedSongs.length > 0 && !currentSong) {
                    setCurrentSong(mergedSongs[0]);
                }

            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };

        fetchSongsAndLikes();
    }, [userId]); // Re-run if user logs in/out

    useEffect(() => {
        if (currentView === 'library') {
            authFetch(`http://localhost:8081/api/users/${userId}/library`)
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


    const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (currentView === 'artist' && value.trim() !== "") {
            setCurrentView('home');
            setSelectedArtistId(null);
            // Reset scroll to top of the main content area
            if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
        }

        if (value.trim() === "") {
            setCurrentFilteredSongs(allSongs);
            setFilteredArtists([]);
            return;
        }

        // 1. Create the matchedSongs variable FIRST so it can be referenced below
        const matchedSongs = allSongs.filter(song =>
            song.name.toLowerCase().includes(value.toLowerCase()) ||
            (song.artist?.name ?? "").toLowerCase().includes(value.toLowerCase())
        );

        // 2. Update the song grid
        setCurrentFilteredSongs(matchedSongs);

        // 3. Extract Unique Artists safely
        const uniqueArtistsMap = new Map<number, Artist>();

        matchedSongs.forEach(s => {
            // Only add if the song has an artist and we haven't added this ID yet
            if (s.artist && s.artist.id && !uniqueArtistsMap.has(s.artist.id)) {
                uniqueArtistsMap.set(s.artist.id, s.artist);
            }
        });
        // 4. Update the artist state
        setFilteredArtists(Array.from(uniqueArtistsMap.values()));
    };

    // --- Navigation Handlers ---
    const handleNavigate = (view: any) => {
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

    const handleGenreDiscovery = async (genreName: string, genreSongs: Song[]) => {
        const token = sessionStorage.getItem("authToken");
        const targetTitle = `Your ${genreName} Playlist`;
        const existingPlaylist = playlists.find(p => p.title === targetTitle);

        if (existingPlaylist) {
            // If it exists, don't create a new one. Just navigate to it and play!
            handlePlaylistClick(existingPlaylist.id);

            toast.current?.show({
                severity: 'info',
                summary: 'Playlist Found',
                detail: `Opening your existing ${genreName} collection.`,
                life: 3000
            });
            return; // Stop execution here
        }

        // Create the auto-generated playlist object
        const playlistData = {
            title: `Your ${genreName} Playlist`,
            description: `Discovered in the Galaxy of Music`,
            visibility: "PUBLIC",
            imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17", // Default galaxy cover
            user_id: { id: userId },
            songs: genreSongs.map(s => ({ id: s.id }))
        };

        try {
            const response = await fetch("http://localhost:8081/api/playlists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(playlistData)
            });

            if (response.ok) {
                // Update library and sidebar immediately
                fetchPlaylists();

                // Set the player to the newly discovered genre set
                setCurrentFilteredSongs(genreSongs);
                setCurrentSong(genreSongs[0]);
                setIsPlaying(true);

                toast.current?.show({
                    severity: 'success',
                    summary: 'Galaxy Playlist Created',
                    detail: `Added "Your ${genreName} Playlist" to your library!`,
                    life: 3000
                });
            }
        } catch (error) {
            console.error("Discovery error:", error);
        }
    };

    const handleArtistClick = (artistId: number) => {
        setSelectedArtistId(artistId);
        setCurrentView('artist');
        if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    };

    // Used by ProfilePage (play from profile without an extra click)
    const handlePlayPlaylist = useCallback(async (playlistId: number) => {
        setActivePlaylistId(playlistId);
        setCurrentView('playlist');

        const existing = playlists.find(p => p.id === playlistId);
        if (existing?.songs?.length) {
            setCurrentFilteredSongs(existing.songs);
            setCurrentSong(existing.songs[0]);
            setIsPlaying(true);
            return;
        }

        try {
            const res = await authFetch(`http://localhost:8081/api/playlists/${playlistId}`);
            if (!res.ok) throw new Error(`Failed to fetch playlist ${playlistId}`);
            const full: Playlist = await res.json();

            setPlaylists(prev => {
                const idx = prev.findIndex(p => p.id === playlistId);
                if (idx === -1) return [...prev, full];
                const next = [...prev];
                next[idx] = full;
                return next;
            });

            const songs = full.songs ?? [];
            setCurrentFilteredSongs(songs);
            if (songs.length) {
                setCurrentSong(songs[0]);
                setIsPlaying(true);
            }
        } catch (e) {
            console.error("Failed to play playlist:", e);
        }
    }, [playlists]);

    const handleOpenCreatePlaylist = () => {
        setCurrentView('create-playlist');
        setActivePlaylistId(null);
    };


    // --- CREATE / EDIT / DELETE PLAYLIST LOGIC ---
    const handleSavePlaylist = async (data: { title: string, description: string, selectedSongIds: number[] }) => {
        const isEditing = currentView === 'edit-playlist' && activePlaylistId;
        const token = sessionStorage.getItem("authToken");
        const selectedSongs = data.selectedSongIds.map(id => ({ id }));

        const playlistData = {
            title: data.title,
            description: data.description || (isEditing ? "" : "Created via App"),
            visibility: "PUBLIC",
            imageurl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
            user_id: { id: userId },
            songs: selectedSongs
        };

        const url = isEditing
            ? `http://localhost:8081/api/playlists/${activePlaylistId}`
            : "http://localhost:8081/api/playlists";

        const method = isEditing ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
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
        if (!audioRef.current || !currentSong?.id) {
            console.warn("Skipping audio load, invalid song:", currentSong);
            return;
        }

        audioRef.current.src =
            `http://localhost:8081/api/songs/${currentSong.id}/stream`;
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

    const toggleLike = async (songId: number) => {
        if (!userId) return;

        // 1. Optimistic UI Update
        // We define the mapping logic once to reuse it
        const updateSongList = (list: Song[]) =>
            list.map(s => s.id === songId ? { ...s, isLiked: !s.isLiked } : s);

        // Update the main list
        setAllSongs(prev => updateSongList(prev));

        // Update the filtered list
        setCurrentFilteredSongs(prev => updateSongList(prev));

        // Update the currently playing song if needed
        if (currentSong?.id === songId) {
            setCurrentSong(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
        }

        // 2. Call Backend
        try {
            await authFetch(`http://localhost:8081/api/songs/${songId}/like?userId=${userId}`, {
                method: "POST"
            });
        } catch (error) {
            console.error("Like failed", error);
            // Revert on error (flip it back)
            setAllSongs(prev => updateSongList(prev));
            setCurrentFilteredSongs(prev => updateSongList(prev));
        }
    };
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
                        onPlayPlaylist={(playlistId: number) => void handlePlayPlaylist(playlistId)}
                    />
                ) : currentView === 'artist-studio' ? (
                    <ArtistUploadPage onUpload={handleArtistUpload} />
                ) : currentView === 'artist' && selectedArtistId ? (
                    (() => {
                        const artistSongs = allSongs.filter(s => s.artist?.id === selectedArtistId);
                        const artistInfo = artistSongs[0]?.artist;

                        // Finding albums (Playlists with "album" in description)
                        // Added ?. to description and artist
                        const artistAlbums = playlists.filter(p =>
                            p.description?.toLowerCase().includes("album") &&
                            p.songs?.some(s => s.artist?.id === selectedArtistId)
                        );

                        // Finding playlists where this artist's music appears
                        // Added check for userId to ensure it only shows YOUR playlists
                        const userPlaylists = playlists.filter(p =>
                            (p.user_id?.id === userId || p.user_id === userId) &&
                            !p.description?.toLowerCase().includes("album") &&
                            p.songs?.some(s => s.artist?.id === selectedArtistId)
                        );

                        return artistInfo ? (
                            <ArtistPage
                                artist={artistInfo}
                                songs={artistSongs}
                                albums={artistAlbums}
                                appearingInPlaylists={userPlaylists}
                                onSongSelect={(song) => { setCurrentSong(song); setIsPlaying(true); }}
                                onAlbumClick={handlePlaylistClick}
                            />
                        ) : <div className="p-8">Artist profile not found.</div>;
                    })()
                ) :currentView === 'library' ? (
                    <LibraryPage
                        library={userLibrary}
                        onPlaylistClick={handlePlaylistClick}
                    />
                ) : currentView === 'explore' ? (
                    <ExplorePage
                        songs={search.length > 0 ? currentFilteredSongs : allSongs}
                        handleSongSelect={(song) => {
                            setCurrentSong(song);
                            setIsPlaying(true);
                        }}
                        onToggleLike={toggleLike}
                    />
                ) : currentView === 'favorites' ? (
                    <FavoritesPage
                        // FILTER LOGIC: Only pass songs where isLiked is TRUE
                        songs={(search.length > 0 ? currentFilteredSongs : allSongs).filter(s => s.isLiked)}
                        handleSongSelect={(song) => {
                            setCurrentSong(song);
                            setIsPlaying(true);
                        }}
                        onToggleLike={toggleLike} // Pass function
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
                        onArtistClick={handleArtistClick}
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
                        if (!React.isValidElement(child)) return child;

                        const isSearching = search.trim() !== "";

                        return (
                            <div className="flex flex-col gap-10">
                                {/* 1. RECOMMENDED ARTISTS (Only on search) */}
                                {isSearching && filteredArtists.length > 0 && (
                                    <section className="px-6 pt-4">
                                        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Recommended
                                            Artists</h2>
                                        <div className="flex flex-wrap gap-6 justify-start">
                                            {filteredArtists.slice(0, 5).map(artist => ( // Scope variable 'artist'
                                                <div
                                                    key={`search-artist-${artist.id}`}
                                                    className="bg-[#181818] hover:bg-[#282828] p-5 rounded-xl transition-all duration-300 cursor-pointer group w-[200px] flex flex-col items-center shadow-lg"
                                                    onClick={() => handleArtistClick(artist.id)}
                                                >
                                                    <div
                                                        className="w-32 h-32 mb-4 relative shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-full overflow-hidden">
                                                        <img
                                                            src={artist.imageUrl || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop'}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            alt={artist.name}
                                                        />
                                                    </div>
                                                    <span
                                                        className="font-bold text-base truncate w-full text-center text-white">{artist.name}</span>
                                                    <span
                                                        className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-bold">Artist</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="h-[1px] bg-white/10 w-full mt-10 mb-2"></div>
                                    </section>
                                )}

                                {/* 2. THE MAIN CONTENT (Songs) */}
                                <div className="px-2">
                                    {React.cloneElement(child as React.ReactElement<any>, {
                                        songs: allSongs,
                                        filteredSongs: currentFilteredSongs,
                                        isSearching: isSearching, // <--- PASS THIS to child to hide its internal title
                                        handleSongSelect: (song: Song) => {
                                            setCurrentSong(song);
                                            setIsPlaying(true);
                                        },
                                        onNavigate: handleNavigate, // <--- CRITICAL UPDATE
                                        onToggleLike: toggleLike,
                                        onArtistClick: handleArtistClick
                                    })}
                                </div>
                            </div>
                        );
                    })
                ))}
            </div>

            {currentSong && (
                <>
                    <PlayerBar
                        currentSong={currentSong}
                        onToggleLike={toggleLike}
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
            {currentView === 'galaxy' && (
                <DiscoveryMap
                    songs={allSongs}
                    onGenreDiscovery={handleGenreDiscovery}
                    onBack={() => handleNavigate('home')}
                />
            )}
        </div>
    );
};

import React, { useState, useEffect, useRef } from "react";
import type { Song, Playlist, Artist } from '../types';

<<<<<<< HEAD
=======
import React, { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import type { Song, Playlist, Artist, PageContentProps, UserLibrary } from '../types';
>>>>>>> ce59eb2 (Artist Page+ Updated searchbar + Updated Artist (to include image for the artist))
import { MainSidebar } from './MainSidebar';
import { TopToolbar } from './TopToolbar';
import { ArtistUploadPage } from "../pages/ArtistUploadPage.tsx";
import { PlayerBar } from "./PlayerBar.tsx";
import { LibraryPage } from '../pages/LibraryPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { PlaylistFormPage } from '../pages/PlaylistFormPage';
<<<<<<< HEAD
=======
import { ArtistPage } from '../pages/ArtistPage';
import './HomaPage.css';
import { authFetch} from "../types/authFetch.ts";
import {Toast} from "primereact/toast";
import {StudyModeOverlay} from "./StudyModeOverlay.tsx"; [StudyModeOverlay];
>>>>>>> ce59eb2 (Artist Page+ Updated searchbar + Updated Artist (to include image for the artist))
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

<<<<<<< HEAD
    const normalizeSongs = (data: any[]): Song[] => {
        return (data || [])
            .filter((s: any) => s.id != null)
            .sort((a: any, b: any) => Number(b.id) - Number(a.id));
    };

    const [currentView, setCurrentView] = useState<'home' | 'library' | 'explore' | 'favorites' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'artist-studio' | 'artist' | 'profile' | 'galaxy'>('home');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
=======

    // View Management
    const [currentView, setCurrentView] = useState<'home' | 'library' | 'explore' |  'favorites' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'artist-studio' | 'artist'>('home');
    // Data States
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [userLibrary, setUserLibrary] = useState<UserLibrary | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Player States
>>>>>>> ce59eb2 (Artist Page+ Updated searchbar + Updated Artist (to include image for the artist))
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

<<<<<<< HEAD
    const handleNavigate = (view: any) => {
=======
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
    const handleNavigate = (view: 'home' | 'library' | 'explore' | 'favorites' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'artist') => {
>>>>>>> ce59eb2 (Artist Page+ Updated searchbar + Updated Artist (to include image for the artist))
        setCurrentView(view);
        setActivePlaylistId(null);
        if (view === 'home') setCurrentFilteredSongs(allSongs);
    };

<<<<<<< HEAD
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
=======
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

    const handleArtistClick = (artistId: number) => {
        setSelectedArtistId(artistId);
        setCurrentView('artist');
        if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
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
                {currentView === 'artist-studio' ? (
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
                        onSongSelect={(song) => {
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
                                        onToggleLike: toggleLike
                                        onArtistClick: handleArtistClick
                                    })}
                                </div>
                            </div>
                        );
                    })
                ))}
            </div>
>>>>>>> ce59eb2 (Artist Page+ Updated searchbar + Updated Artist (to include image for the artist))

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
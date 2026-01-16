import React, { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import type { Song, Playlist, Artist, UserLibrary } from '../types';

import { MainSidebar } from './MainSidebar';
import { TopToolbar } from './TopToolbar';
import { ArtistUploadPage } from "../pages/ArtistUploadPage.tsx";
import { PlayerBar } from "./PlayerBar.tsx";
import { LibraryPage } from '../pages/LibraryPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { PlaylistFormPage } from '../pages/PlaylistFormPage';
import { ExplorePage } from '../pages/ExplorePage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { DiscoveryMap } from "../pages/DiscoveryMap.tsx";
import { ArtistPage } from '../pages/ArtistPage';
import { ProfilePage } from './ProfilePage'; 
import { StudyModeOverlay } from "./StudyModeOverlay.tsx";

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
    // --- Refs ---
    const toast = useRef<Toast>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // --- View Management ---
    const [visible, setVisible] = useState<boolean>(true);
    const [currentView, setCurrentView] = useState<'home' | 'library' | 'explore' | 'favorites' | 'playlist' | 'create-playlist' | 'edit-playlist' | 'artist-studio' | 'artist' | 'profile' | 'galaxy'>('home');
    
    // --- Data States ---
    const [search, setSearch] = useState<string>("");
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [currentFilteredSongs, setCurrentFilteredSongs] = useState<Song[]>([]);
    const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
    const [userLibrary, setUserLibrary] = useState<UserLibrary | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);
    const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);

    // --- Player States ---
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<string>("0:00");
    const [duration, setDuration] = useState<string>("0:00");
    const [volume, setVolume] = useState<number>(1);
    const [isShuffling, setIsShuffling] = useState<boolean>(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

    // --- Study Mode State ---
    const [isStudyOpen, setIsStudyOpen] = useState(false);
    const [studyState, setStudyState] = useState({
        isActive: false,
        mode: 'REGULAR' as 'STUDY' | 'BREAK' | 'REGULAR',
        timeLeft: 0,
        studyDuration: 0,
        breakDuration: 0
    });

    // --- Helpers ---
    const normalizeSongs = (data: any[]): Song[] => {
        return (data || [])
            .filter((s: any) => s.id != null)
            .sort((a: any, b: any) => Number(b.id) - Number(a.id));
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // --- Data Fetching ---
    const fetchPlaylists = useCallback(() => {
        const token = sessionStorage.getItem("authToken");
        if (!token) return;

        authFetch(`${apiUrl}/playlists`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setPlaylists(data))
            .catch(err => console.error("Error fetching playlists:", err));
    }, []);

    useEffect(() => {
        fetchPlaylists();
        
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

                if (mergedSongs.length > 0 && !currentSong) {
                    setCurrentSong(mergedSongs[0]);
                }
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };

        fetchSongsAndLikes();
    }, [userId, fetchPlaylists]);

    // --- Study Mode Logic ---
    const handleStudySwitch = (mode: 'STUDY' | 'BREAK' | 'REGULAR') => {
        const url = mode === 'STUDY' ? `${apiUrl}/songs/genre/STUDY` : `${apiUrl}/songs`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const validSongs = normalizeSongs(data);
                setCurrentFilteredSongs(validSongs);
                if (validSongs.length > 0) setCurrentSong(validSongs[0]);
            });
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

    // --- Audio Event Handlers ---
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100 || 0);
            setCurrentTime(formatTime(current));
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(formatTime(audioRef.current.duration));
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
        const previousIndex = currentIndex <= 0 ? currentFilteredSongs.length - 1 : currentIndex - 1;
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

    // --- Navigation & Search ---
    const handleNavigate = (view: any) => {
        setCurrentView(view);
        setActivePlaylistId(null);
        if (view === 'home') setCurrentFilteredSongs(allSongs);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (currentView === 'artist' && value.trim() !== "") {
            setCurrentView('home');
            setSelectedArtistId(null);
        }

        if (value.trim() === "") {
            setCurrentFilteredSongs(allSongs);
            setFilteredArtists([]);
            return;
        }

        const matchedSongs = allSongs.filter(song =>
            song.name.toLowerCase().includes(value.toLowerCase()) ||
            (song.artist?.name ?? "").toLowerCase().includes(value.toLowerCase())
        );

        setCurrentFilteredSongs(matchedSongs);
        const uniqueArtistsMap = new Map<number, Artist>();
        matchedSongs.forEach(s => {
            if (s.artist?.id && !uniqueArtistsMap.has(s.artist.id)) {
                uniqueArtistsMap.set(s.artist.id, s.artist);
            }
        });
        setFilteredArtists(Array.from(uniqueArtistsMap.values()));
    };

    const toggleLike = async (songId: number) => {
        if (!userId) return;
        const updateSongList = (list: Song[]) =>
            list.map(s => s.id === songId ? { ...s, isLiked: !s.isLiked } : s);

        setAllSongs(prev => updateSongList(prev));
        setCurrentFilteredSongs(prev => updateSongList(prev));
        if (currentSong?.id === songId) {
            setCurrentSong(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
        }

        try {
            await authFetch(`${apiUrl}/songs/${songId}/like?userId=${userId}`, { method: "POST" });
        } catch (error) {
            console.error("Like failed", error);
        }
    };

    // --- Render Content ---
    const renderContent = () => {
        switch (currentView) {
            case 'explore': return <ExplorePage songs={allSongs} handleSongSelect={(song) => { setCurrentSong(song); setIsPlaying(true); }} onToggleLike={toggleLike} />;
            case 'favorites': return <FavoritesPage songs={allSongs.filter(s => s.isLiked)} handleSongSelect={(song) => { setCurrentSong(song); setIsPlaying(true); }} onToggleLike={toggleLike} />;
            case 'artist': return <ArtistPage artistId={selectedArtistId} onSongSelect={(song) => { setCurrentSong(song); setIsPlaying(true); }} />;
            case 'profile': return <ProfilePage userId={userId!} />;
            case 'galaxy': return <DiscoveryMap songs={allSongs} onPlay={(song) => { setCurrentSong(song); setIsPlaying(true); }} />;
            case 'library': return <LibraryPage library={userLibrary} onPlaylistClick={(id) => { setActivePlaylistId(id); setCurrentView('playlist'); }} />;
            case 'artist-studio': return <ArtistUploadPage />;
            default:
                return (
                    <div className="flex flex-col gap-10">
                        {search.trim() !== "" && filteredArtists.length > 0 && (
                            <section className="px-6 pt-4">
                                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Artists</h2>
                                <div className="flex flex-wrap gap-6">
                                    {filteredArtists.map(artist => (
                                        <div key={artist.id} onClick={() => { setSelectedArtistId(artist.id); setCurrentView('artist'); }} className="cursor-pointer">
                                            <img src={artist.imageUrl || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop'} alt={artist.name} className="w-32 h-32 rounded-full object-cover" />
                                            <p className="text-center mt-2 text-white">{artist.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        <div className="px-6">
                            {React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child as any, { songs: allSongs, filteredSongs: currentFilteredSongs, isSearching: search !== "", handleSongSelect: (s: Song) => { setCurrentSong(s); setIsPlaying(true); }, onToggleLike: toggleLike }) : child)}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="music-platform-wrapper flex min-h-screen relative">
            <MainSidebar 
                visible={visible} setVisible={setVisible} playlists={playlists} 
                onNavigate={handleNavigate as any} currentView={currentView} userId={userId} 
            />

            <div className={`custom-main-content ${visible ? 'main-content-pushed' : 'main-content-full'}`} ref={mainContentRef}>
                <TopToolbar 
                    search={search} handleSearchChange={handleSearchChange} visible={visible} setVisible={setVisible} 
                    onStudyClick={() => setIsStudyOpen(true)} studyState={studyState} onGiveUp={stopStudyMode}
                    onOpenProfile={() => setCurrentView('profile')}
                />

                <StudyModeOverlay 
                    isActive={isStudyOpen} onClose={() => setIsStudyOpen(false)} onActivate={startStudyMode}
                    isStudyActive={studyState.isActive} timeLeft={studyState.timeLeft} mode={studyState.mode} onGiveUp={stopStudyMode}
                />

                {studyState.isActive && (
                    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center mb-[90px]">
                        <h1 className="text-[12rem] font-extrabold text-white m-0 font-mono">
                            {Math.floor(studyState.timeLeft / 60)}:{(studyState.timeLeft % 60).toString().padStart(2, '0')}
                        </h1>
                        <p className="text-gray-400 text-[2.5rem] tracking-[8px] uppercase mt-5">
                            {studyState.mode === 'STUDY' ? '📚 Focus Time 📚' : '✨ Break Time ✨'}
                        </p>
                    </div>
                )}

                <div className="content-area">
                    {renderContent()}
                </div>
            </div>

            {currentSong && (
                <>
                    <PlayerBar 
                        currentSong={currentSong} onToggleLike={toggleLike} isPlaying={isPlaying} setIsPlaying={setIsPlaying}
                        progress={progress} currentTime={currentTime} duration={duration} volume={volume} setVolume={setVolume}
                        handleNextSong={handleNextSong} handlePreviousSong={handlePreviousSong}
                    />
                    <audio 
                        ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleSongEnded}
                        src={`${apiUrl}/songs/${currentSong.id}/stream`}
                    />
                </>
            )}
        </div>
    );
};
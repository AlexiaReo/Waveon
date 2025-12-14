// src/components/AppLayout.tsx

import React, { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import type { Song, Playlist, PageContentProps } from '../types';
import { MainSidebar } from './MainSidebar';
import { TopToolbar } from './TopToolbar';
import { PlayerBar } from './Playerbar';
import './HomaPage.css';

// REMOVED: handleSongSelect, filteredSongs, songs props which were causing TS6133 errors
interface AppLayoutProps {
    children: React.ReactNode;
}

// REMOVED: handleSongSelect, filteredSongs, songs from destructuring
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    // --- STATE MANAGEMENT (Centralized) ---
    const [visible, setVisible] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");

    // NOTE: We MUST keep these states for fetching and updating the UI
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
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

    // --- Data Fetching: Playlists ---
    useEffect(() => {
        fetch("http://localhost:8081/api/playlists")
            .then(res => res.json())
            .then(data => setPlaylists(data))
            .catch(err => console.error("Error fetching playlists:", err));
    }, []);

    // --- Data Fetching: Songs ---
    useEffect(() => {
        fetch("http://localhost:8081/api/songs")
            .then(res => res.json())
            .then(data => {
                setAllSongs(data);
                setCurrentFilteredSongs(data); // Initially, show all songs
                if (data.length > 0) {
                    setCurrentSong(data[0]); // Set the first song from DB as current
                }
            })
            .catch(err => console.error("Error fetching songs:", err));
    }, []);


    // --- Audio Logic (No changes here) ---
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
            // 1. Get the current duration
            const duration = audioRef.current.duration;

            // **CRITICAL FIX:** Guard against NaN or Infinity duration
            if (!isFinite(duration) || duration <= 0) {
                console.warn("Audio duration is not finite (NaN or 0). Cannot seek yet.");
                return;
            }

            const rect = e.currentTarget.getBoundingClientRect();
            // Calculate the click position (0.0 to 1.0)
            const clickPosition = (e.clientX - rect.left) / rect.width;

            // Calculate the new time in seconds
            const newTime = clickPosition * duration;

            // Set the audio element's time
            audioRef.current.currentTime = newTime;
        }
    };

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            const newVolume = Math.min(1, Math.max(0, clickPosition));
            setVolume(newVolume);
        }
    };

    // --- Control Handlers ---
    const toggleShuffle = () => setIsShuffling(prev => !prev);
    const toggleRepeat = () => setRepeatMode(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));

    // --- Search Handler ---
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        const filtered = allSongs.filter(song =>
            song.name.toLowerCase().includes(value.toLowerCase()) ||
            song.artist.name.toLowerCase().includes(value.toLowerCase())
        );
        setCurrentFilteredSongs(filtered); // Update the queue visible to the user
    };


    // --- Navigation Handlers (Unchanged) ---
    const handleNavItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
        document.querySelectorAll('.custom-nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.custom-playlist-item').forEach(i => i.classList.remove('active-playlist'));
        e.currentTarget.classList.add('active');
        setActivePlaylistId(null);
    };

    const handlePlaylistClick = (playlistId: number) => {
        document.querySelectorAll('.custom-nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.custom-playlist-item').forEach(i => i.classList.remove('active-playlist'));
        document.getElementById(`playlist-${playlistId}`)?.classList.add('active-playlist');
        setActivePlaylistId(playlistId);
        // Implement logic to fetch songs for this specific playlist ID and update setCurrentFilteredSongs
    };


    // Inside export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => { ... }

// ... (Your other logic and effects) ...

// --- Effects (REINSTATE THIS CRITICAL BLOCK) ---

// 1. Effect to handle changing the current song
    useEffect(() => {
        if (audioRef.current && currentSong) {
            // Set the new stream source
            audioRef.current.src = `http://localhost:8081/api/songs/${currentSong.id}/stream`;
            audioRef.current.load(); // Request load of new source
            audioRef.current.play(); // Attempt to play immediately
            setIsPlaying(true);
        }
    }, [currentSong]); // Runs every time currentSong changes

// 2. Effect to handle play/pause toggle
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            else audioRef.current.pause();
        }
    }, [isPlaying]); // Runs every time isPlaying changes

// 3. Effect to handle volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);


    // --- RENDER ---
    return (
        <div className="music-platform-wrapper flex min-h-screen">
            <MainSidebar
                visible={visible}
                setVisible={setVisible}
                playlists={playlists}
                handleNavItemClick={handleNavItemClick}
                handlePlaylistClick={handlePlaylistClick}
                activePlaylistId={activePlaylistId}
            />

            {/* Main Content Area */}
            <div
                className={`custom-main-content ${visible ? 'main-content-pushed' : 'main-content-full'}`}
                ref={mainContentRef}
            >
                <TopToolbar
                    search={search}
                    setSearch={setSearch}
                    handleSearchChange={handleSearchChange}
                    visible={visible}
                    setVisible={setVisible}
                />

                {/* NOTE: We clone the children to inject the song data and selector */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        // Construct the props object
                        const injectedProps: PageContentProps = {
                            songs: allSongs, // Internal state
                            filteredSongs: currentFilteredSongs, // Internal state
                            handleSongSelect: (song: Song) => { // Internal logic
                                setCurrentSong(song);
                                setIsPlaying(true);
                                mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            },
                        };

                        // Inject the props. We use the 'injectedProps' variable directly.
                        // TypeScript now successfully matches the call because the type is clear.
                        return React.cloneElement(child, injectedProps as any); // Use 'as any' as a final escape hatch if strict TS still complains, but passing the variable often resolves it.
                    }
                    return child;
                })}
            </div>

            {/* Audio Element and Player Bar */}
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
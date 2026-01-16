// src/pages/ArtistPage.tsx
import React from 'react';
import type { Artist, Song, Playlist } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VerifiedIcon from '@mui/icons-material/Verified';

interface ArtistPageProps {
    artist: Artist;
    songs: Song[];
    albums: Playlist[];
    appearingInPlaylists: Playlist[];
    onSongSelect: (song: Song) => void;
    onAlbumClick: (albumId: number) => void;
    isFollowing: boolean;
    onToggleFollow: () => void;
}

export const ArtistPage: React.FC<ArtistPageProps> = ({
                                                          artist,
                                                          songs,
                                                          albums,
                                                          appearingInPlaylists,
                                                          onSongSelect,
                                                          onAlbumClick,
    isFollowing,onToggleFollow
                                                      }) => {
    return (
        <div className="artist-page text-white bg-gradient-to-b from-[#404040] to-[#121212] min-h-full flex flex-col font-sans rounded-xl overflow-hidden pb-12 items-start">

            {/* --- Artist Hero Header (Forced Left) --- */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end p-8 bg-gradient-to-b from-transparent to-black/60 min-h-[340px] w-full justify-start">
                <div className="flex-shrink-0 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-full overflow-hidden border-4 border-white/10 w-[230px] h-[230px]">
                    <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex flex-col gap-2 mb-2 text-left items-start">
                    <div className="flex items-center gap-2 text-blue-400">
                        <VerifiedIcon fontSize="small"/>
                        <span className="text-xs font-bold uppercase tracking-widest text-white">Verified Artist</span>
                    </div>
                    <button
                        onClick={onToggleFollow}
                        className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                            isFollowing
                                ? "bg-transparent border-white text-white hover:bg-white/10"
                                : "bg-[#f15809] border-[#f15809] text-black hover:scale-105"
                        }`}
                    >
                        {isFollowing ? "Following" : "Follow"}
                    </button>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-lg">
                        {artist.name}
                    </h1>
                    <p className="text-sm md:text-base font-bold text-gray-200 mt-2 opacity-90">
                        {artist.followers?.toLocaleString() || 0} monthly listeners
                    </p>
                </div>
            </div>

            {/* --- Content Body --- */}
            <div className="px-8 py-6 flex flex-col gap-12 bg-black/20 w-full items-start">

                {/* --- Popular Songs List (Fixed Grid Alignment) --- */}
                <section className="w-full text-left items-start flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 px-2">Popular</h2>

                    <div className="flex flex-col w-full max-w-4xl">
                        {songs.map((song, index) => (
                            <div
                                key={`artist-top-song-${song.id}`}
                                className="group flex items-center px-4 py-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors w-full"
                                onClick={() => onSongSelect(song)}
                            >
                                {/* 1. FIXED RAIL: INDEX (35px) */}
                                <div className="flex-shrink-0" style={{ width: '35px' }}>
                                    <span className="text-[#b3b3b3] group-hover:text-white text-sm font-medium">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* 2. FIXED RAIL: IMAGE (50px) */}
                                <div className="flex-shrink-0 flex justify-start" style={{ width: '50px' }}>
                                    <img
                                        src={song.imageUrl}
                                        alt={song.name}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            objectFit: 'cover',
                                            borderRadius: '50%',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    />
                                </div>

                                {/* 3. FLEX RAIL: SONG NAME (Left Aligned) */}
                                <div className="flex-grow text-left overflow-hidden">
                                    <p className="text-sm font-semibold text-white truncate m-0">
                                        {song.name}
                                    </p>
                                </div>

                                {/* 4. FIXED RAIL: DURATION (80px, Aligned Right) */}
                                <div
                                    className="flex-shrink-0 text-[#b3b3b3] text-xs font-medium text-right"
                                    style={{ width: '80px' }}
                                >
                                    3:45
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Discography --- */}
                {albums.length > 0 && (
                    <section className="w-full text-left flex flex-col items-start">
                        <h2 className="text-2xl font-bold mb-6 px-2">Discography</h2>
                        <div className="flex flex-wrap gap-6 justify-start w-full">
                            {albums.map((album) => (
                                <div
                                    key={album.id}
                                    className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer group w-[180px] flex flex-col items-start"
                                    onClick={() => onAlbumClick(album.id)}
                                >
                                    <div className="relative mb-4 w-full">
                                        <img
                                            src={album.imageUrl}
                                            className="w-full aspect-square object-cover rounded shadow-lg"
                                            alt={album.title}
                                        />
                                        <div className="absolute bottom-2 right-2 bg-[#ff5e00] p-3 rounded-full shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <PlayArrowIcon className="text-black" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-sm truncate text-white text-left w-full">{album.title}</h3>
                                    <p className="text-xs text-[#b3b3b3] mt-1 font-medium">Album</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- Appears On --- */}
                <section className="w-full text-left flex flex-col items-start">
                    <h2 className="text-2xl font-bold mb-6 px-2">Appears On</h2>
                    <div className="flex flex-wrap gap-6 justify-start w-full">
                        {appearingInPlaylists.map((playlist) => (
                            <div
                                key={playlist.id}
                                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer group w-[180px] flex flex-col items-start"
                                onClick={() => onAlbumClick(playlist.id)}
                            >
                                <img
                                    src={playlist.imageUrl}
                                    className="w-full aspect-square object-cover rounded mb-4 shadow-lg"
                                    alt={playlist.title}
                                />
                                <h3 className="font-bold text-sm truncate text-white text-left w-full">{playlist.title}</h3>
                                <p className="text-xs text-[#b3b3b3] mt-1 font-medium">Playlist</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
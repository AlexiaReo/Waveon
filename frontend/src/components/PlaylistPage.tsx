import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button} from "primereact/button";
import { apiUrl } from "../config/api";

interface UserDTO {
    id: number;
    username: string;
}

type Privacy = "PUBLIC" | "PRIVATE";

interface PlaylistDTO {
    id: number;
    title: string;
    user_id: UserDTO;
    description?: string | null;
    visibility: Privacy;
    imageUrl: string;
}

interface ArtistDTO {
    id: number;
    name: string;
    followers: number;
}

interface SongDTO {
    id: number;
    name: string;
    artist: ArtistDTO;
    filepath: string;
    imageUrl: string;
}

interface PlaylistPageProps {
    playlistId: number;
    onBack: () => void;
}

export const PlaylistPage: React.FC<PlaylistPageProps> = ({playlistId, onBack}) => {
    const [playlist, setPlaylist] = useState<PlaylistDTO | null>(null);
    const [songs, setSongs] = useState<SongDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentSong, setCurrentSong] = useState<SongDTO | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playlistUrl = useMemo(() => apiUrl(`/playlists/${playlistId}`), [playlistId]);
    const playlistSongsUrl = useMemo(() => apiUrl(`/playlists/${playlistId}/songs`), [playlistId]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all([
            fetch(playlistUrl).then(async (res) => {
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                return res.json();
            }),
            fetch(playlistSongsUrl).then(async (res) => {
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                return res.json();
            }),
        ])
            .then(([playlistJson, songsJson]) => {
                if (cancelled) return;
                setPlaylist(playlistJson as PlaylistDTO);
                setSongs((songsJson as SongDTO[]) ?? []);
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : "Failed to load playlist");
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [playlistUrl, playlistSongsUrl]);

    // Load+play when selecting a song
    useEffect(() => {
        if (!audioRef.current || !currentSong) return;
        audioRef.current.src = apiUrl(`/songs/${currentSong.id}/stream`);
        audioRef.current.play();
        setIsPlaying(true);
    }, [currentSong]);

    // Play/pause toggle
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.play();
        else audioRef.current.pause();
    }, [isPlaying]);

    const headerImageUrl = playlist?.imageUrl || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80";

    return (
        <div className="bg-[#121212] text-white min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between backdrop-blur bg-black/30 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <Button icon="pi pi-arrow-left" className="p-button-text p-button-rounded" onClick={onBack} />
                    <div className="flex flex-col leading-tight">
                        <span className="text-gray-300 text-xs uppercase tracking-wider">Playlist</span>
                        <span className="text-white font-semibold">{playlist?.title ?? "Loading..."}</span>
                    </div>
                </div>
                <div className="text-xs text-gray-300">{songs.length} songs</div>
            </div>

            {loading && (
                <div className="px-6 py-10 text-gray-300 max-w-6xl mx-auto">Loading playlist…</div>
            )}

            {!loading && error && (
                <div className="max-w-6xl mx-auto px-6 py-10">
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                        <div className="font-semibold">Failed to load playlist</div>
                        <div className="text-sm text-red-200 mt-1">{error}</div>
                    </div>
                </div>
            )}

            {!loading && !error && playlist && (
                <>
                    {/* Hero */}
                    <section className="relative w-full">
                        <div className="absolute inset-0">
                            <img src={headerImageUrl} alt="" className="w-full h-full object-cover opacity-40" />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#1db954]/20 via-black/70 to-[#121212]" />
                        </div>
                        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-8">
                            <div className="flex flex-col md:flex-row md:items-end gap-6">
                                <div className="w-40 h-40 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#2a2a2a]">
                                    <img src={playlist.imageUrl} alt={playlist.title} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1">
                                    <div className="text-xs uppercase tracking-wider text-white/80">Playlist</div>
                                    <h1 className="text-4xl md:text-6xl font-extrabold mt-2 leading-none">{playlist.title}</h1>
                                    <div className="text-gray-200/90 mt-4 text-sm max-w-3xl">
                                        {playlist.description || ""}
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-200">
                                        <span className="text-white/90 font-semibold">{playlist.user_id.username}</span>
                                        <span className="text-white/40">•</span>
                                        <span>{songs.length} songs</span>
                                        <span className="text-white/40">•</span>
                                        <span className="text-white/70">{playlist.visibility}</span>
                                    </div>

                                    <div className="mt-6 flex items-center gap-3">
                                        <Button
                                            label="Play"
                                            icon="pi pi-play"
                                            className="p-button-rounded"
                                            style={{backgroundColor: "#1db954", borderColor: "#1db954"}}
                                            onClick={() => {
                                                if (songs.length > 0) setCurrentSong(songs[0]);
                                            }}
                                        />
                                        <Button icon="pi pi-ellipsis-h" className="p-button-text p-button-rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Song list */}
                    <section className="max-w-6xl mx-auto px-6 pb-24">
                        <div className="mt-6 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-[40px_1fr_160px] gap-4 px-4 py-3 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                                <div>#</div>
                                <div>Title</div>
                                <div>Artist</div>
                            </div>

                            {songs.map((s, idx) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setCurrentSong(s)}
                                    className={
                                        "w-full text-left grid grid-cols-[40px_1fr_160px] gap-4 px-4 py-3 " +
                                        "hover:bg-white/5 transition-colors focus:outline-none"
                                    }
                                >
                                    <div className="text-gray-400">{idx + 1}</div>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img src={s.imageUrl} alt={s.name} className="w-10 h-10 rounded-md object-cover" />
                                        <div className="min-w-0">
                                            <div className="font-semibold truncate">{s.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{playlist.title}</div>
                                        </div>
                                    </div>
                                    <div className="text-gray-200/90 truncate">{s.artist?.name ?? ""}</div>
                                </button>
                            ))}

                            {songs.length === 0 && (
                                <div className="px-4 py-8 text-gray-400">No songs in this playlist yet.</div>
                            )}
                        </div>
                    </section>

                    {/* Bottom mini-player */}
                    {currentSong && (
                        <div className="fixed bottom-4 left-4 right-4 bg-[#181818] border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-2xl">
                            <div className="flex items-center gap-3 min-w-0">
                                <img src={currentSong.imageUrl} alt={currentSong.name} className="w-12 h-12 rounded-md object-cover" />
                                <div className="min-w-0">
                                    <div className="font-semibold truncate">{currentSong.name}</div>
                                    <div className="text-sm text-gray-400 truncate">{currentSong.artist?.name ?? ""}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center"
                                type="button"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                <i className={`pi ${isPlaying ? "pi-pause" : "pi-play"}`} />
                            </button>
                        </div>
                    )}

                    {/* Hidden audio element */}
                    {currentSong?.id && (
                        <audio ref={audioRef} />
                    )}
                </>
            )}
        </div>
    );
};


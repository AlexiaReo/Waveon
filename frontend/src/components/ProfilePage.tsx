import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {Button} from "primereact/button";
import { apiUrl } from "../config/api";

interface SongDTO {
    id: number;
    name: string;
    genre: string;
    imageUrl: string;
}

interface UserDTO {
    id: number;
    username: string;
}

type Privacy = "PUBLIC" | "PRIVATE";

interface PlaylistDTO {
    id: number;
    title: string;
    description?: string | null;
    visibility: Privacy;
    imageUrl: string;
}

interface UserProfileDTO {
    user: UserDTO;
    isOwner: boolean;
    playlists: PlaylistDTO[];
}

interface ProfilePageProps {
    userId: number;
    viewerId: number;
    onBack: () => void;
    onOpenPlaylist: (playlistId: number) => void;
    isArtist: boolean;
    onBecomeArtist: () => void;
    onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = (props: ProfilePageProps) => {
    const { userId, viewerId, onBack, onOpenPlaylist, isArtist, onBecomeArtist, onLogout } = props;
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<'playlists' | 'my-songs'>('playlists');
    const [mySongs, setMySongs] = useState<SongDTO[]>([]);
    const [mySongsLoading, setMySongsLoading] = useState(false);
    const [mySongsError, setMySongsError] = useState<string | null>(null);

    const profileUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set("viewerId", String(viewerId));
        return apiUrl(`/users/${userId}/profile?${params.toString()}`);
    }, [userId, viewerId]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        const token = sessionStorage.getItem("authToken");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        fetch(profileUrl, { headers })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
                }
                return res.json();
            })
            .then((data: UserProfileDTO) => {
                if (!cancelled) setProfile(data);
            })
            .catch((e: unknown) => {
                if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [profileUrl]);

    const canShowMySongs = Boolean(profile?.isOwner && isArtist);

    const fetchMySongs = async () => {
        const token = sessionStorage.getItem("authToken");
        if (!token) {
            setMySongsError("Missing auth token. Please log in again.");
            return;
        }

        setMySongsLoading(true);
        setMySongsError(null);
        try {
            const res = await fetch(apiUrl("/songs/me"), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
            }
            const data: SongDTO[] = await res.json();
            setMySongs(data);
        } catch (e: unknown) {
            setMySongsError(e instanceof Error ? e.message : "Failed to load My Songs");
        } finally {
            setMySongsLoading(false);
        }
    };

    const handleDeleteMySong = async (songId: number) => {
        const ok = window.confirm("Delete this song? This will remove it from WaveOn and delete the uploaded files.");
        if (!ok) return;

        const token = sessionStorage.getItem("authToken");
        if (!token) {
            setMySongsError("Missing auth token. Please log in again.");
            return;
        }

        try {
            const res = await fetch(apiUrl(`/songs/${songId}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok && res.status !== 204) {
                const text = await res.text().catch(() => "");
                throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
            }
            // Optimistic update + refresh
            setMySongs(prev => prev.filter(s => s.id !== songId));
        } catch (e: unknown) {
            setMySongsError(e instanceof Error ? e.message : "Failed to delete song");
        }
    };

    const headerImageUrl = useMemo(() => {
        const first = profile?.playlists?.[0]?.imageUrl;
        return first || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80";
    }, [profile?.playlists]);

    const playlistStats = useMemo(() => {
        const publicCount = profile?.playlists?.filter((p) => p.visibility === "PUBLIC").length ?? 0;
        return {total: publicCount, publicCount};
    }, [profile?.playlists]);

    const publicPlaylists = useMemo(() => {
        return (profile?.playlists ?? []).filter((p) => p.visibility === "PUBLIC");
    }, [profile?.playlists]);

    const privatePlaylists = useMemo(() => {
        return (profile?.playlists ?? []).filter((p) => p.visibility === "PRIVATE");
    }, [profile?.playlists]);

    const handleCopyProfileLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // Fallback (older browsers)
            try {
                const el = document.createElement("textarea");
                el.value = window.location.href;
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
            } catch {
                // ignore
            }
        } finally {
            setActionsOpen(false);
        }
    };

    const handleEditToggle = () => setEditOpen((v) => !v);

    const handleBecomeArtistClick = async () => {
        setEditOpen(false);
        await Promise.resolve(onBecomeArtist());
    };

    const handleLogoutClick = () => {
        setEditOpen(false);
        onLogout();
    };

    return (
        <div className="bg-[#121212] text-white min-h-screen flex flex-col">
            {/* Spotify-ish top bar */}
            <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between backdrop-blur bg-black/30 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <Button
                        icon="pi pi-arrow-left"
                        className="p-button-text p-button-rounded"
                        onClick={onBack}
                    />
                    <div className="flex flex-col leading-tight">
                        <span className="text-gray-300 text-xs uppercase tracking-wider">Profile</span>
                        <span className="text-white font-semibold">
                            {profile?.user?.username ?? "Loading..."}
                        </span>
                    </div>
                </div>
                <div className="text-xs text-gray-300">
                    {profile?.isOwner ? "Viewing as owner" : "Viewing public profile"}
                </div>
            </div>

            <main className="flex-1 w-full">
                {loading && (
                    <div className="px-6 py-10 text-gray-300 max-w-6xl mx-auto">Loading profile…</div>
                )}

                {!loading && error && (
                    <div className="max-w-6xl mx-auto px-6 py-10">
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                        <div className="font-semibold">Failed to load profile</div>
                        <div className="text-sm text-red-200 mt-1">{error}</div>
                        </div>
                    </div>
                )}

                {!loading && !error && profile && (
                    <>
                        {/* Hero */}
                        <section className="relative w-full">
                            {/* Background image + gradient overlay */}
                            <div className="absolute inset-0">
                                <img
                                    src={headerImageUrl}
                                    alt=""
                                    className="w-full h-full object-cover opacity-40"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-[#1db954]/20 via-black/70 to-[#121212]" />
                            </div>

                            <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-8">
                                <div className="flex flex-col md:flex-row md:items-end gap-6">
                                    {/* Avatar / cover square */}
                                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl border border-white/10 bg-[#2a2a2a] flex items-center justify-center">
                                        <span className="text-3xl md:text-5xl font-bold text-white/90">
                                            {(profile.user.username || "U").slice(0, 1).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="text-xs uppercase tracking-wider text-white/80">Profile</div>
                                        <h1 className="text-4xl md:text-6xl font-extrabold mt-2 leading-none">
                                            {profile.user.username}
                                        </h1>
                                        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-200">
                                            <span className="text-white/90 font-semibold">WaveOn</span>
                                            <span className="text-white/40">•</span>
                                            <span>{playlistStats.total} playlists</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 flex items-center gap-3">
                                            {profile.isOwner && (
                                                <div className="relative">
                                                    <Button
                                                        label="Edit Profile"
                                                        icon="pi pi-user-edit"
                                                        className="p-button-rounded"
                                                        style={{backgroundColor: "#1db954", borderColor: "#1db954"}}
                                                        onClick={handleEditToggle}
                                                    />
                                                    {editOpen && (
                                                        <div
                                                            className="absolute left-0 mt-2 w-56 rounded-lg border border-white/10 bg-[#1e1e1e] shadow-xl z-50"
                                                            role="menu"
                                                        >
                                                            <button
                                                                type="button"
                                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-white/10 ${isArtist ? 'text-white/40 cursor-not-allowed' : 'text-white'}`}
                                                                onClick={isArtist ? undefined : handleBecomeArtistClick}
                                                                disabled={isArtist}
                                                            >
                                                                Become an Artist
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10"
                                                                onClick={handleLogoutClick}
                                                            >
                                                                Logout
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="relative">
                                                <Button
                                                    icon="pi pi-ellipsis-h"
                                                    className="p-button-text p-button-rounded"
                                                    onClick={() => setActionsOpen((v) => !v)}
                                                />
                                                {actionsOpen && (
                                                    <div
                                                        className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-[#1e1e1e] shadow-xl z-50"
                                                        role="menu"
                                                    >
                                                        <button
                                                            type="button"
                                                            className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10"
                                                            onClick={handleCopyProfileLink}
                                                        >
                                                            Copy profile link
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10"
                                                            onClick={() => setActionsOpen(false)}
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    {/* Content */}
                    <section className="max-w-6xl mx-auto px-6 pb-10">

                        {/* Tabs */}
                        <div className="mt-6 flex items-center gap-3 border-b border-white/10 pb-3">
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-full text-sm ${activeTab === 'playlists' ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                                onClick={() => setActiveTab('playlists')}
                            >
                                Playlists
                            </button>
                            {canShowMySongs && (
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-full text-sm ${activeTab === 'my-songs' ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => {
                                        setActiveTab('my-songs');
                                        // Lazy-load the first time
                                        if (mySongs.length === 0 && !mySongsLoading) {
                                            void fetchMySongs();
                                        }
                                    }}
                                >
                                    My Songs
                                </button>
                            )}
                        </div>

                        {activeTab === 'my-songs' && canShowMySongs ? (
                            <div className="mt-6">
                                <div className="flex items-end justify-between mb-3">
                                    <div>
                                        <h2 className="text-xl font-bold">My Songs</h2>
                                        <div className="text-sm text-gray-400">Tracks you uploaded as an Artist</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            label="Refresh"
                                            icon="pi pi-refresh"
                                            className="p-button-text"
                                            onClick={() => void fetchMySongs()}
                                        />
                                        <div className="text-sm text-gray-400">{mySongs.length} total</div>
                                    </div>
                                </div>

                                {mySongsLoading && (
                                    <div className="text-gray-300">Loading…</div>
                                )}

                                {!mySongsLoading && mySongsError && (
                                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                                        <div className="font-semibold">Failed to load My Songs</div>
                                        <div className="text-sm text-red-200 mt-1">{mySongsError}</div>
                                    </div>
                                )}

                                {!mySongsLoading && !mySongsError && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {mySongs.map((s) => (
                                            <div key={s.id} className="bg-[#181818] rounded-xl p-4 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={s.imageUrl}
                                                        alt={s.name}
                                                        className="w-14 h-14 rounded-lg object-cover bg-black/30"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-semibold truncate" title={s.name}>{s.name}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-end">
                                                    <Button
                                                        label="Delete"
                                                        icon="pi pi-trash"
                                                        className="p-button-danger p-button-text"
                                                        onClick={() => void handleDeleteMySong(s.id)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {mySongs.length === 0 && (
                                            <div className="text-gray-400">No uploaded songs yet.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Public playlists row */}
                                <div className="mt-6">
                                    <div className="flex items-end justify-between mb-3">
                                        <div>
                                            <h2 className="text-xl font-bold">Public Playlists</h2>
                                            <div className="text-sm text-gray-400">Visible to everyone</div>
                                        </div>
                                        <div className="text-sm text-gray-400">{publicPlaylists.length} total</div>
                                    </div>

                                    <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        {publicPlaylists.map((p) => (
                                            <div
                                                key={p.id}
                                                className="group bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl p-4 cursor-pointer flex-shrink-0 w-44 sm:w-48"
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => onOpenPlaylist(p.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") onOpenPlaylist(p.id);
                                                }}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={p.imageUrl}
                                                        alt={p.title}
                                                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                                                    />
                                                    <div className="absolute right-2 bottom-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                                        <button
                                                            className="w-11 h-11 rounded-full bg-[#1db954] text-black shadow-2xl flex items-center justify-center"
                                                            aria-label={`Open ${p.title}`}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onOpenPlaylist(p.id);
                                                            }}
                                                        >
                                                            <i className="pi pi-play" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="font-semibold truncate" title={p.title}>{p.title}</div>
                                                    <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                                                        {p.description || "Public playlist"}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {publicPlaylists.length === 0 && (
                                            <div className="text-gray-400">No public playlists.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Private playlists row (owner only) */}
                                {profile.isOwner && (
                                    <div className="mt-10">
                                        <div className="flex items-end justify-between mb-3">
                                            <div>
                                                <h2 className="text-xl font-bold">Private Playlists</h2>
                                                <div className="text-sm text-gray-400">Only visible to you</div>
                                            </div>
                                            <div className="text-sm text-gray-400">{privatePlaylists.length} total</div>
                                        </div>

                                        <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {privatePlaylists.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="group bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl p-4 cursor-pointer flex-shrink-0 w-44 sm:w-48"
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => onOpenPlaylist(p.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") onOpenPlaylist(p.id);
                                                    }}
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={p.imageUrl}
                                                            alt={p.title}
                                                            className="w-full aspect-square object-cover rounded-lg shadow-lg"
                                                        />
                                                        <div className="absolute right-2 bottom-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                                            <button
                                                                className="w-11 h-11 rounded-full bg-[#1db954] text-black shadow-2xl flex items-center justify-center"
                                                                aria-label={`Open ${p.title}`}
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onOpenPlaylist(p.id);
                                                                }}
                                                            >
                                                                <i className="pi pi-play" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <div className="font-semibold truncate" title={p.title}>{p.title}</div>
                                                        <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                                                            {p.description || "Private playlist"}
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="text-[11px] px-2 py-1 rounded-full bg-purple-900/30 border border-purple-700/60 text-purple-200">
                                                                PRIVATE
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {privatePlaylists.length === 0 && (
                                                <div className="text-gray-400">No private playlists.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                    </>
                )}
            </main>
        </div>
    );
};


import React, {useEffect, useMemo, useState} from "react";
import {Button} from "primereact/button";

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
}

export const ProfilePage: React.FC<ProfilePageProps> = ({userId, viewerId, onBack, onOpenPlaylist}) => {
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const profileUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set("viewerId", String(viewerId));
        return `http://localhost:8081/api/users/${userId}/profile?${params.toString()}`;
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

    const headerImageUrl = useMemo(() => {
        const first = profile?.playlists?.[0]?.imageUrl;
        return first || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80";
    }, [profile?.playlists]);

    const playlistStats = useMemo(() => {
        const total = profile?.playlists?.length ?? 0;
        const publicCount = profile?.playlists?.filter((p) => p.visibility === "PUBLIC").length ?? 0;
        const privateCount = profile?.playlists?.filter((p) => p.visibility === "PRIVATE").length ?? 0;
        return {total, publicCount, privateCount};
    }, [profile?.playlists]);

    const publicPlaylists = useMemo(() => {
        return (profile?.playlists ?? []).filter((p) => p.visibility === "PUBLIC");
    }, [profile?.playlists]);

    const privatePlaylists = useMemo(() => {
        return (profile?.playlists ?? []).filter((p) => p.visibility === "PRIVATE");
    }, [profile?.playlists]);

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
                                            {profile.isOwner && (
                                                <>
                                                    <span className="text-white/40">•</span>
                                                    <span className="text-white/80">{playlistStats.publicCount} public</span>
                                                    <span className="text-white/40">•</span>
                                                    <span className="text-white/80">{playlistStats.privateCount} private</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 flex items-center gap-3">
                                            <Button
                                                label="Play"
                                                icon="pi pi-play"
                                                className="p-button-rounded"
                                                style={{backgroundColor: "#1db954", borderColor: "#1db954"}}
                                            />
                                            <Button
                                                icon="pi pi-ellipsis-h"
                                                className="p-button-text p-button-rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    {/* Content */}
                    <section className="max-w-6xl mx-auto px-6 pb-10">
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
                    </section>
                    </>
                )}
            </main>
        </div>
    );
};


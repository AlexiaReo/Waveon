// src/components/MainSidebar.tsx
import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import type { Playlist } from '../types';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import LibraryMusicOutlinedIcon from '@mui/icons-material/LibraryMusicOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface MainSidebarProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    playlists: Playlist[];
    onNavigate: (view: 'home' | 'library' | 'explore' | 'favorites' | 'playlist') => void;
    handlePlaylistClick: (playlistId: number) => void;
    onCreatePlaylist: () => void; // ADDED: New prop
    activePlaylistId: number | null;
    currentView: string;
    userId?: number;
    userRole: string | null;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
                                                            visible,
                                                            setVisible,
                                                            playlists,
                                                            onNavigate,
                                                            handlePlaylistClick,
                                                            onCreatePlaylist, // Destructure new prop
                                                            activePlaylistId,
                                                            currentView,
                                                            userId,
                                                            userRole
                                                        }) => {

    const userPlaylists = playlists.filter(p => {
        return p.user_id?.id === userId;
    });

    return (
        <Sidebar
            visible={visible}
            onHide={() => setVisible(false)}
            className="custom-sidebar w-60 xl:w-72 border-none"
            showCloseIcon={true}
            modal={true}
        >
            <div className="logo flex items-center gap-2 text-xl font-bold p-2">
                <AudiotrackIcon fontSize="inherit" /> <span id="platform-name">WAVEON</span>
            </div>

            {/* Main Navigation */}
            <nav className="nav-section flex flex-col gap-1">
                <div
                    className={`custom-nav-item ${currentView === 'home' && !activePlaylistId ? 'active' : ''}`}
                    onClick={() => onNavigate('home')}
                >
                    <HomeOutlinedIcon fontSize="inherit" /> <span>Home</span>
                </div>
                <div
                    className={`custom-nav-item ${currentView === 'explore' ? 'active' : ''}`}
                    onClick={() => onNavigate('explore')}
                >
                    <ExploreOutlinedIcon fontSize="inherit" /> <span>Explore</span>
                </div>
                {userRole === 'ROLE_ARTIST' && (
                    <div
                        className={`custom-nav-item ${currentView === 'artist-studio' ? 'active' : ''}`}
                        onClick={() => onNavigate('artist-studio' as any)}
                        style={{ marginTop: '10px', border: '1px solid rgba(241, 88, 9, 0.3)' }}
                    >
                        <CloudUploadIcon fontSize="inherit" style={{ color: '#f15809' }} />
                        <span style={{ color: '#f15809', fontWeight: 'bold' }}>Only for Artist</span>
                    </div>
                )}
                <div
                    className={`custom-nav-item ${currentView === 'library' ? 'active' : ''}`}
                    onClick={() => onNavigate('library')}
                >
                    <LibraryMusicOutlinedIcon fontSize="inherit" /> <span>Your Library</span>
                </div>
            </nav>

            <h4 className="text-sm font-semibold text-gray-400 mt-4 mb-2">PLAYLISTS</h4>
            <div className="nav-section flex flex-col gap-1">
                {/* User Playlists */}
                {userPlaylists.map((p) => (
                    <div
                        key={`playlist-${p.id}`}
                        id={`playlist-${p.id}`}
                        className={`custom-nav-item custom-playlist-item ${activePlaylistId === p.id ? 'active-playlist' : ''}`}
                        onClick={() => handlePlaylistClick(p.id)}
                    >
                        <img
                            src={p.imageUrl}
                            alt={p.title}
                            style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                            className="rounded flex-shrink-0"
                        />
                        <span className="truncate">{p.title}</span>
                    </div>
                ))}

                {/* Utility Items */}
                {/* ADDED: onClick handler */}
                <div className="custom-nav-item mt-2" onClick={onCreatePlaylist}>
                    <AddBoxOutlinedIcon fontSize="inherit" /> <span>Create Playlist</span>
                </div>
                <div
                    className={`custom-nav-item ${currentView === 'favorites' ? 'active' : ''}`}
                    onClick={() => onNavigate('favorites')}
                >
                    <FavoriteOutlinedIcon fontSize="inherit" /> <span>Favorite Songs</span>
                </div>
            </div>

        </Sidebar>
    );
};
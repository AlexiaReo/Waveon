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

interface MainSidebarProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    playlists: Playlist[];
    handleNavItemClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    handlePlaylistClick: (playlistId: number) => void;
    activePlaylistId: number | null;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
                                                            visible,
                                                            setVisible,
                                                            playlists,
                                                            handleNavItemClick,
                                                            handlePlaylistClick,
                                                            activePlaylistId
                                                        }) => {

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
                <div className="custom-nav-item active" onClick={handleNavItemClick}>
                    <HomeOutlinedIcon fontSize="inherit" /> <span>Home</span>
                </div>
                <div className="custom-nav-item" onClick={handleNavItemClick}>
                    <ExploreOutlinedIcon fontSize="inherit" /> <span>Explore</span>
                </div>
                <div className="custom-nav-item" onClick={handleNavItemClick}>
                    <LibraryMusicOutlinedIcon fontSize="inherit" /> <span>Your Library</span>
                </div>
            </nav>

            <h4 className="text-sm font-semibold text-gray-400 mt-4 mb-2">PLAYLISTS</h4>
            <div className="nav-section flex flex-col gap-1">
                {/* User Playlists */}
                {playlists.map((p) => (
                    <div
                        key={p.id}
                        id={`playlist-${p.id}`}
                        className={`custom-nav-item custom-playlist-item ${activePlaylistId === p.id ? 'active' : ''}`}
                        onClick={() => handlePlaylistClick(p.id)}
                    >
                        <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-6 h-6 rounded object-cover"
                            style={{ minWidth: '24px', minHeight: '24px' }}
                        />
                        <span className="truncate">{p.title}</span>
                    </div>
                ))}

                {/* Utility Items */}
                <div className="custom-nav-item mt-2">
                    <AddBoxOutlinedIcon fontSize="inherit" /> <span>Create Playlist</span>
                </div>
                <div className="custom-nav-item">
                    <FavoriteOutlinedIcon fontSize="inherit" /> <span>Favorite Songs</span>
                </div>
            </div>
        </Sidebar>
    );
};
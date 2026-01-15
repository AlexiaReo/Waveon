import React from "react";
import type { Song } from "../types";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface MusicCardProps {
    song: Song;
    onSongSelect: (song: Song) => void;
    gradientStyle: React.CSSProperties;
    onToggleLike: (id: number) => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({ song, onSongSelect, gradientStyle, onToggleLike}) => {
    return (
        <div className="music-card group relative" onClick={() => onSongSelect(song)}>
            {/* 1. Card Image */}
            <div className="card-image" style={gradientStyle}>
                <img
                    src={song.imageUrl}
                    alt={song.name}
                    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}}
                />
                <div className="play-overlay" style={{fontSize: '24px'}}>
                    <i className="pi pi-play" style={{ fontSize: '1.5rem' }}></i>
                </div>
            </div>

            {/* 2. Song Title */}
            <h3 className="card-title truncate" title={song.name}>{song.name}</h3>

            {/* 3. Bottom Row: Artist Name (Left) + Heart (Right) */}
            <div className="flex justify-between items-center mt-1">
                <p
                    className="card-subtitle truncate flex-1"
                    title={song.artist?.name}
                    style={{ margin: 0, paddingRight: '8px' }} // Add padding so text doesn't hit the heart
                >
                    {song.artist?.name || "Unknown Artist"}
                </p>

                <button
                    className="hover:scale-110 transition-transform flex items-center justify-center text-gray-400 hover:text-white"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevents the card click (play song)
                        onToggleLike(song.id);
                    }}
                >
                    {song.isLiked ? (
                        <FavoriteIcon style={{ fontSize: '20px', color: '#acacac' }} /> // Full Red Heart
                    ) : (
                        <FavoriteBorderIcon style={{ fontSize: '20px' }} /> // Empty Border Heart
                    )}
                </button>
            </div>
        </div>
    );
};
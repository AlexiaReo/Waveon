// src/components/MusicCard.tsx
import React from "react";
import type { Song } from "../types";

interface MusicCardProps {
    song: Song;
    onSongSelect: (song: Song) => void;
    gradientStyle: React.CSSProperties;
}

export const MusicCard: React.FC<MusicCardProps> = ({ song, onSongSelect, gradientStyle}) => {
    return (
        <div className="music-card" onClick={() => onSongSelect(song)}>
            <div className="card-image" style={gradientStyle}>
                <img src={song.imageUrl} alt={song.name}
                     style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}}/>
                <div className="play-overlay" style={{fontSize: '24px'}}>
                    ▶
                </div>
            </div>
            <h3 className="card-title" title={song.name}>{song.name}</h3>
            <p className="card-subtitle" title={song.artist?.name}>{song.artist?.name || "Unknown Artist"}</p>
        </div>
    );
};
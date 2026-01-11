// src/components/PlayerBar.tsx
import type { Song } from '../types';
import RepeatIcon from '@mui/icons-material/Repeat';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';

interface PlayerBarProps {
    currentSong: Song;
    isPlaying: boolean;
    setIsPlaying: (v: boolean) => void;
    progress: number;
    currentTime: string;
    duration: string;
    volume: number;
    setVolume: (v: number) => void;
    isShuffling: boolean;
    toggleShuffle: () => void;
    repeatMode: 'off' | 'one' | 'all';
    toggleRepeat: () => void;
    handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleNextSong: () => void;
    handlePreviousSong: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
                                                        currentSong,
                                                        isPlaying,
                                                        setIsPlaying,
                                                        progress,
                                                        currentTime,
                                                        duration,
                                                        volume,
                                                        setVolume,
                                                        isShuffling,
                                                        toggleShuffle,
                                                        repeatMode,
                                                        toggleRepeat,
                                                        handleSeek,
                                                        handleVolumeChange,
                                                        handleNextSong,
                                                        handlePreviousSong,
                                                    }) => {

    const playPauseIconStyle = {
        fontSize: '18px',
        lineHeight: '1',
    };

    const repeatIconColor = repeatMode !== 'off' ? '#f15809' : '#ffffff';
    const shuffleIconColor = isShuffling ? '#f15809' : '#ffffff';

    return (
        <div className="player-bar">
            {/* Now Playing */}
            <div className="now-playing flex items-center gap-3 w-60">
                <div
                    className="now-playing-image w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <img
                        src={currentSong.imageUrl}
                        alt={currentSong.name}
                        className="w-14 h-14 rounded-lg object-cover"
                    />
                </div>
                <div className="now-playing-info">
                    <h4 className="m-0 mb-1 text-sm font-semibold truncate" title={currentSong.name}>{currentSong.name}</h4>
                    <p className="m-0 text-xs text-gray-400 truncate">{currentSong.artist?.name}</p>
                </div>
            </div>

            {/* Player Controls */}
            <div className="player-controls flex-1 flex flex-col gap-2 items-center">
                <div className="control-buttons flex gap-4 items-center">
                    <button
                        className="control-btn"
                        aria-label="Shuffle"
                        onClick={toggleShuffle}
                        style={{color: shuffleIconColor}}
                    >
                        <ShuffleIcon fontSize="inherit"/>
                    </button>
                    <button
                        className="control-btn"
                        aria-label="Previous"
                        onClick={handlePreviousSong}>
                        ⏮
                    </button>
                    <button
                        className={`control-btn play`}
                        onClick={() => setIsPlaying(!isPlaying)}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        <i
                            className={`pi ${isPlaying ? "pi-pause" : "pi-play"} text-white`}
                            style={playPauseIconStyle}
                        />
                    </button>
                    <button
                        className="control-btn"
                        aria-label="Next"
                        onClick={handleNextSong}>
                        ⏭
                    </button>
                    <button
                        className="control-btn"
                        aria-label="Repeat"
                        onClick={toggleRepeat}
                        style={{color: repeatIconColor}}
                    >
                        {repeatMode === 'one' ?
                            <RepeatIcon fontSize="inherit" style={{borderBottom: '2px solid #f15809'}}/> :
                            <RepeatIcon fontSize="inherit"/>
                        }
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar w-full max-w-xl flex items-center gap-3">
                    <span className="time text-xs text-gray-400 min-w-10 text-right">{currentTime}</span>

                    {/* FIX: Conditionally apply onClick only if duration is loaded and not "0:00" */}
                    <div
                        className="progress-track"
                        onClick={duration !== "0:00" ? handleSeek : undefined} // Only allow seeking if duration is set
                        style={{cursor: duration !== "0:00" ? 'pointer' : 'default'}} // Change cursor visual cue
                    >
                        <div className="progress-fill" style={{width: `${progress}%`}}></div>
                    </div>
                    <span className="time text-xs text-gray-400 min-w-10">{duration}</span>
                </div>
            </div>

            {/* Volume Controls */}
            <div className="volume-controls flex items-center gap-3 w-60 justify-end">
                <span className="volume-icon text-xl cursor-pointer"
                      onClick={() => setVolume(volume === 0 ? 0.7 : 0)}>
                     <VolumeDownIcon fontSize="inherit"/>
                </span>
                <div className="volume-slider" onClick={handleVolumeChange}>
                    <div className="volume-fill" style={{width: `${volume * 100}%`}}></div>
                </div>
            </div>
        </div>
    );
};
import React, { useState, type ChangeEvent, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";


interface Playlist {
    id: number;
    title: string;
    image: string;
}

interface Artist {
    id: number;
    name: string;
    followers: number;
}

interface Song {
    id: number;
    name: string;
    artist: Artist;
    //duration: string;
    //image: string;

    audioUrl: string;

}

// const playlists: Playlist[] = [
//     { id: 1, name: "vibe", image: "https://images.unsplash.com/photo-1719057572864-e61f5204f2ee?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHQlMjBhZXN0aGV0aWN8ZW58MHx8MHx8fDA%3D&fm=jpg&q=60&w=3000" },
//     { id: 2, name: ":)", image: "https://www.rollingstone.com/wp-content/uploads/2023/11/RandB-Illo.jpg?w=1581&h=1054&crop=1" },
// ];
//
// const songs: Song[] = [
//     {
//         id: 1,
//         name: "All I Know",
//         artist: "The Weeknd, Future",
//         duration: "5:21",
//         image: "https://images.genius.com/3e171b6e6f898af35930efd2bd4dba97.970x970x1.png",
//     },
//     {
//         id: 2,
//         name: "Been 2 Gone",
//         artist: "Lil Maru",
//         duration: "3:31",
//         image: "https://i.scdn.co/image/ab67616d0000b2734e6e07edb5d15d91704b8e69",
//     },
// ];

export const HomePage: React.FC = () => {
    const [visible, setVisible] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);

    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    const audioRef = useRef<HTMLAudioElement>(null);


    useEffect(() => {
        fetch("http://localhost:8080/api/playlists")
            .then(res => res.json())
            .then(data => setPlaylists(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetch("http://localhost:8080/api/songs")
            .then(res => res.json())
            .then(data => {
                setSongs(data);
                setFilteredSongs(data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);

        if (value.trim() === "") {
            setFilteredSongs(songs);
        } else {
            const filtered = songs.filter(song =>
                song.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSongs(filtered);
        }
    };

    //play pause button
    const handlePlayClick = (song: Song) => {
        if (currentSong?.id === song.id) {
            // toggle pause / play
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play();
                setIsPlaying(true);
            }
            return;
        }

        // new song → set & play immediately
        setCurrentSong(song);
        setTimeout(() => {
            audioRef.current?.play();
            setIsPlaying(true);
        }, 100);
    };
    
    //player bar
    const updateProgress = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };


    const leftContents = (
        <div className="flex items-center space-x-3">
            <Button
                icon="pi pi-bars ml-1 mr-1"
                className="p-button-text p-button-rounded p-button-secondary"
                onClick={() => setVisible(true)}
            />
            <h2 className="text-white font-semibold text-lg m-2">Welcome back</h2>
        </div>
    );

    const centerContents = (
        <div className="flex items-center space-x-2 p-input-icon-left">
            <i className="pi pi-search ml-2 mr-1 text-gray-200" />
            <InputText
                value={search}
                onChange={handleSearchChange}
                placeholder="Search song or artist"
                className="pl-5 pr-2 py-2"
                style={{ width: "230x" }}
            />
        </div>
    );

    const rightContents = (
        <div className="flex items-center space-x-3">
            <Button
                icon="pi pi-user"
                className="p-button-rounded p-button-secondary"
            />
        </div>
    );


    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col">

            {/* NAV / TOOLBAR */}
            <Toolbar left={leftContents} center={centerContents} right={rightContents}
                     className="bg-gray-800 border-none shadow-2xl sticky z-30" />

            {/* SIDEBAR */}
            <Sidebar visible={visible} onHide={() => setVisible(false)}
                     className="bg-gray-850 text-white w-64" showCloseIcon={false}>
                <h3 className="mb-4 text-lg font-semibold">Your Playlists</h3>

                <div className="space-y-3">
                    {playlists.map((p) => (
                        <div key={p.id}
                             className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-all">
                            <img src={p.image} alt={p.title} className="w-16 h-16 rounded-md object-cover" />
                            <span>{p.title}</span>
                        </div>
                    ))}
                </div>
            </Sidebar>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
                <div className="w-full max-w-3xl">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Your Songs</h2>

                    <div className="space-y-4">
                        {filteredSongs.map((song) => (
                            <div key={song.id}
                                 className="flex items-center justify-between bg-gray-800 rounded-2xl p-4 hover:bg-gray-700 transition">

                                <div className="flex items-center space-x-4">
                                    {/*<img src={song.image} alt={song.name}
                                         className="w-16 h-16 rounded-lg object-cover" />*/}

                                    <div>
                                        <p className="font-semibold text-lg">{song.name}</p>
                                        <p className="text-gray-400 text-sm">{song.artist.name}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePlayClick(song)}
                                    className="text-white hover:text-green-400 text-2xl"
                                >
                                    {currentSong?.id === song.id && isPlaying ? "❚❚" : "▶"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* PLAYER BAR */}
            {currentSong && (
                <div className="fixed bottom-0 left-0 right-0 bg-gray-850 border-t border-gray-700 px-6 py-4 
                                flex items-center justify-between shadow-2xl">

                    {/* LEFT: Song info */}
                    <div className="flex items-center space-x-4">
                        {/*<img src={currentSong.image} className="h-14 w-14 rounded-md shadow-lg object-cover" />*/}
                        <div>
                            <p className="font-semibold text-white">{currentSong.name}</p>
                            <p className="text-gray-400 text-sm">{currentSong.artist.name}</p>
                        </div>
                    </div>

                    {/* CENTER: Controls + progress */}
                    <div className="flex flex-col items-center w-1/3">
                        <button
                            onClick={() => {
                                if (isPlaying) {
                                    audioRef.current?.pause();
                                    setIsPlaying(false);
                                } else {
                                    audioRef.current?.play();
                                    setIsPlaying(true);
                                }
                            }}
                            className="text-white text-3xl hover:text-green-400 transition mb-2"
                        >
                            {isPlaying ? "❚❚" : "▶"}
                        </button>

                        {/* Progress bar */}
                        <div className="w-full flex items-center space-x-2">
                            <span className="text-xs text-gray-400">
                                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                            </span>

                            <input type="range" className="w-full h-1 bg-gray-600 rounded-lg"
                                   min={0} max={duration} value={currentTime} onChange={handleSeek} />

                            <span className="text-xs text-gray-400">
                                {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT: Volume */}
                    <div className="flex items-center space-x-3">
                        <i className="pi pi-volume-down text-white"></i>
                        <input type="range" min="0" max="1" step="0.01" className="w-24"
                               onChange={(e) => {
                                   if (audioRef.current) audioRef.current.volume = Number(e.target.value);
                               }} />
                    </div>

                    {/* HIDDEN AUDIO ELEMENT */}
                    <audio ref={audioRef} src={currentSong.audioUrl} onTimeUpdate={updateProgress} />
                </div>
            )}

        </div>
    );
};
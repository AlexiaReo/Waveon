import React,{useState,type ChangeEvent, useEffect} from "react";
import {Button} from "primereact/button";
import {Sidebar} from "primereact/sidebar";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {useRef} from "react";

interface Playlist {
    id: number;
    title: string;
    imageUrl: string;
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
    filepath:string;
    imageUrl: string;
}

interface HomePageProps {
    onNavigateProfile: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({onNavigateProfile}) => {
    const [visible, setVisible] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        fetch("http://localhost:8081/api/playlists")
            .then(res => res.json())
            .then(data => setPlaylists(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetch("http://localhost:8081/api/songs")
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

    const audioRef = useRef<HTMLAudioElement>(null);

    // Set audio only when selecting a new song
    useEffect(() => {
        if (audioRef.current && currentSong) {
            audioRef.current.src = `http://localhost:8081/api/songs/${currentSong.id}/stream`;
            audioRef.current.play();
        }
    }, [currentSong]);

// Handle play/pause toggle
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.play();
            else audioRef.current.pause();
        }
    }, [isPlaying]);

    const centerContents = (
        <div className="flex items-center space-x-2 p-input-icon-left">
            <i className="pi pi-search ml-2 mr-1 text-gray-200"/>
            <InputText
                value={search}
                onChange={handleSearchChange}
                placeholder="Search song or artist"
                className="pl-5 pr-2 py-2"
                style={{width: "230px"}}
            />
        </div>
    );

    const rightContents = (
        <div className="flex items-center space-x-3">
            <Button
                icon="pi pi-user"
                className="p-button-rounded p-button-secondary"
                onClick={onNavigateProfile}
            />
        </div>
    );

    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col">
            {/* Toolbar */}
            <Toolbar
                left={leftContents}
                center={centerContents}
                right={rightContents}
                className="bg-gray-800 border-none shadow-2xl sticky z-30"/>

            {/* Sidebar */}
            <Sidebar
                visible={visible}
                onHide={() => setVisible(false)}
                className="bg-gray-850 text-white w-64"
                showCloseIcon={false}
            >
                <h3 className="mb-4 text-lg font-semibold">Your Playlists</h3>
                <div className="space-y-3 overflow-visible">
                    {playlists.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 hover:shadow-lg cursor-pointer transition-all"
                        >
                            <img
                                src={p.imageUrl}
                                alt={p.title}
                                className="w-16 h-16 rounded-md object-cover"
                            />
                            <span>{p.title}</span>
                        </div>
                    ))}
                </div>
            </Sidebar>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
                <div className="w-full max-w-3xl">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Your Songs</h2>

                    <div className="space-y-4">
                        {filteredSongs.map((song) => (
                            <div
                                key={song.id}
                                className="flex items-center justify-between bg-gray-800 rounded-2xl p-4 hover:bg-gray-700 hover:shadow-lg transition-all"
                                onClick={() => {
                                    if (song && song.id) {
                                        setCurrentSong(song);
                                        setIsPlaying(true);
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={song.imageUrl}
                                        alt={song.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-lg">{song.name}</p>
                                        <p className="text-gray-400 text-sm">{song.artist.name}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            {currentSong?.filepath && (
                <div
                    className="fixed bottom-4 left-4 right-4 bg-gray-800 p-3 rounded-lg flex items-center justify-between shadow-lg">
                    <div className="flex items-center space-x-4">
                        <img
                            src={currentSong.imageUrl}
                            alt={currentSong.name}
                            className="w-12 h-12 rounded-md"
                        />
                        <div>
                            <p className="font-semibold">{currentSong.name}</p>
                            <p className="text-gray-400 text-sm">{currentSong.artist.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 bg-gray-700 rounded-md text-white"
                    >
                        <i className={`pi ${isPlaying ? "pi-pause" : "pi-play"} text-xl`}/>
                    </button>
                </div>
            )}

            {/* Hidden audio element (render only when a song is selected, to avoid /undefined requests) */}
            {currentSong?.id && (
                <audio ref={audioRef} src={`http://localhost:8081/api/songs/${currentSong.id}/stream`} />
            )}
        </div>
    );
};

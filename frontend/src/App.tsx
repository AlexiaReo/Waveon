import {useMemo, useState} from "react";
import {HomePage} from "./components/HomePage.tsx";
import {ProfilePage} from "./components/ProfilePage.tsx";
import {PlaylistPage} from "./components/PlaylistPage.tsx";
import {PrimeReactProvider} from "primereact/api";

import 'primereact/resources/themes/md-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex
import './App.css'


function App() {
    const [view, setView] = useState<"home" | "profile" | "playlist">("home");
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

    // Temporary until authentication exists in the app.!!!!!!!
    const currentUserId = 2;

    const profileUserId = useMemo(() => currentUserId, [currentUserId]);

    return (
        <>
            <PrimeReactProvider>
                {view === "home" && (
                    <HomePage onNavigateProfile={() => setView("profile")} />
                )}
                {view === "profile" && (
                    <ProfilePage
                        userId={profileUserId}
                        viewerId={currentUserId}
                        onBack={() => setView("home")}
                        onOpenPlaylist={(playlistId) => {
                            setSelectedPlaylistId(playlistId);
                            setView("playlist");
                        }}
                    />
                )}
                {view === "playlist" && selectedPlaylistId != null && (
                    <PlaylistPage
                        playlistId={selectedPlaylistId}
                        onBack={() => setView("profile")}
                    />
                )}
            </PrimeReactProvider>
        </>
    )
}

export default App

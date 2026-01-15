import {useEffect, useMemo, useState} from "react";
import {HomePage} from "./components/HomePage.tsx";
import {ProfilePage} from "./components/ProfilePage.tsx";
import {PlaylistPage} from "./components/PlaylistPage.tsx";
import {PrimeReactProvider} from "primereact/api";
import { LoginPage } from "./pages/LoginPage.tsx";

import 'primereact/resources/themes/md-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex
import './App.css'


function App() {
    const [view, setView] = useState<"home" | "profile" | "playlist">("home");
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        const storedUserId = sessionStorage.getItem("userId");
        if (token && storedUserId) {
            setUserId(Number(storedUserId));
        }
    }, []);

    if (!userId) {
        return (
            <PrimeReactProvider>
                <LoginPage onLoginSuccess={(id) => {
                    setUserId(id);
                    setView("home");
                }} />
            </PrimeReactProvider>
        );
    }

    const profileUserId = useMemo(() => userId, [userId]);

    return (
        <>
            <PrimeReactProvider>
                {view === "home" && (
                    <HomePage onNavigateProfile={() => setView("profile")} />
                )}
                {view === "profile" && (
                    <ProfilePage
                        userId={profileUserId}
                        viewerId={userId}
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

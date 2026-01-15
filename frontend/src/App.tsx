
import 'primereact/resources/themes/md-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex
import './App.css'
import {AppLayout} from "./components/AppLayout.tsx";
import {HomePage} from "./pages/HomePage.tsx";
import { useState, useEffect} from "react";
import { LoginPage} from "./pages/LoginPage.tsx";


function App() {
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        const storedUserId = sessionStorage.getItem("userId");

        if (token && storedUserId) {
            setUserId(Number(storedUserId)); // persist login
        }
    }, []);

    if (!userId) {
        return <LoginPage onLoginSuccess={setUserId} />;
    }
    return (
        <>
            <AppLayout userId={userId} onLogout={() => setUserId(null)}>
                <HomePage />
            </AppLayout>
        </>
    )
}

export default App


import 'primereact/resources/themes/md-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex
import './App.css'
import {AppLayout} from "./components/AppLayout.tsx";
import {HomePage} from "./pages/HomePage.tsx";


function App() {
    // const [count, setCount] = useState(0)

    return (
        <>
            <AppLayout>
                <HomePage />
            </AppLayout>
        </>
    )
}

export default App

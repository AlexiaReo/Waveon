
import {HomePage} from "./components/HomePage.tsx";
import {PrimeReactProvider} from "primereact/api";

import 'primereact/resources/themes/md-dark-deeppurple/theme.css';
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex
import './App.css'


function App() {
    // const [count, setCount] = useState(0)

    return (
        <>
            <PrimeReactProvider>
                <HomePage></HomePage>
            </PrimeReactProvider>
        </>
    )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Profile from '../pages/Profile/Profile';
import Header from '../components/Header';
import About from '../pages/About/About';
import Creating from '../pages/Home/Creating/Creating';
import Stats from '../pages/Stats/Stats';


export default function AppRouter(){
    return(
        <>
            <BrowserRouter>
                <Header />
                
                <Routes>
                    <Route path="/" element={<Creating />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* <Route path="/creating" element={<Creating />} /> */}
                    <Route path="/about" element={<About />} />
                    <Route path="/statistics" element={<Stats />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

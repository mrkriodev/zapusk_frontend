import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Profile from '../pages/Profile/Profile';
import Header from '../components/Header';
import About from '../pages/About/About';


export default function AppRouter(){
    return(
        <>
            <BrowserRouter>
                <Header />
                
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* <Route path="/creating" element={<Creating />} /> */}
                    <Route path="/about" element={<About />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}
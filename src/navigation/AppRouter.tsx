import Settings from "../pages/Settings/Settings";
import MyIdeas from "../pages/Ideas/MyIdeas";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Profile from '../pages/Profile/Profile';
import About from '../pages/About/About';
import Creating from '../pages/Home/Creating/Creating';
import Stats from '../pages/Stats/Stats';
import {
    ActivityPage, FactoryPage, ModelplacePage, OrdersPage, PersonalCorePage, PlanPage, StudioPage,
} from '../pages/ComingSoon/sections';


export default function AppRouter(){
    return(
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Creating />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* <Route path="/creating" element={<Creating />} /> */}
                    <Route path="/about" element={<About />} />
                    <Route path="/statistics" element={<Stats />} />
                    {/* Разделы из дизайна, для которых пока нет backend API */}
                    <Route path="/modelplace" element={<ModelplacePage />} />
                    <Route path="/factory" element={<FactoryPage />} />
                    <Route path="/studio" element={<StudioPage />} />
                    <Route path="/account/activity" element={<ActivityPage />} />
                    <Route path="/account/orders" element={<OrdersPage />} />
                    <Route path="/account/knowledge" element={<PersonalCorePage />} />
                    <Route path="/account/plan" element={<PlanPage />} />
                    <Route path="/account/settings" element={<Settings />} />
                    <Route path="/account/ideas" element={<MyIdeas />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

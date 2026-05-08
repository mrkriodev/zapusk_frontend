import { Link, useLocation } from "react-router-dom"
import { Sparkles, User } from 'lucide-react';

export default function Header(){
    const location = useLocation();

    const navItems = [
        { path: '/about', label: 'About', icon: Sparkles },
        { path: '/profile', label: 'Profile', icon: User }
    ]
    
    return(
    <header className="w-full fixed z-50 flex justify-between items-center py-3 px-5 bg-blue-950/80 border-b border-blue-400/20 ">
        
        <Link
        to={'/'}>
            <div 
            className="text-2xl font-bold bg-linear-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
                ZAPUSK
            </div>
        </Link>

        <nav className="flex gap-2">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon;
                return(
                <Link 
                to={item.path}
                key={item.label}
                onClick={(e) => {if (item.path === "/about") e.preventDefault()}}
                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-blue-300 hover:bg-blue-800/30'
                  }`}>
                <Icon className="w-4 h-4" />
                {item.label}
                </Link>)
            })}
        </nav>
        
    </header>)
}
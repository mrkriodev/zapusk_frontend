import { Box, User } from "lucide-react";
import ModelItem from "./components/ModelItem";

const mockModels = [
  { id: 1, name: 'Шестеренка 50мм', date: '2026-04-20', size: '2.4 MB' },
  { id: 2, name: 'Крепежный кронштейн', date: '2026-04-18', size: '1.8 MB' },
  { id: 3, name: 'Корпус датчика', date: '2026-04-15', size: '3.2 MB' },
  { id: 4, name: 'Колесо робота', date: '2026-04-12', size: '4.1 MB' },
  { id: 5, name: 'Держатель кабеля', date: '2026-04-10', size: '1.2 MB' }
];

export default function Profile(){
    return(
    <div className="min-h-screen pt-16 bg-linear-to-br from-blue-950 via-indigo-950 to-blue-950 h-screen overflow-hidden">
      
      <div className="container mx-auto px-6 pt-12 pb-7 h-full flex flex-col min-h-0">
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md rounded-3xl border border-blue-400/30 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-24 h-24 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">Username</h1>
              <p className="text-blue-300">email@gmail.com</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white mb-1">{mockModels.length}</div>
              <div className="text-blue-300">Созданных моделей</div>
            </div>
          </div>
        </div>


        <div className="flex flex-col flex-1 min-h-0">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 shrink-0">
            <Box className="w-7 h-7 text-purple-400" />
            Ваши 3D Модели
          </h2>
        
        <div className="flex-1 min-h-0 overflow-y-auto  [scrollbar-width:none]                
        [-ms-overflow-style:none]              
        [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0
        ">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockModels.map((model) => (
                  <ModelItem model={model} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}
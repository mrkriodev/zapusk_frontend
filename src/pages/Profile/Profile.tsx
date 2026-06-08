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
      
      <div className="container mx-auto lg:px-6 lg:pt-12 lg:pb-7 px-2 pt-4 h-full flex flex-col min-h-0">
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md rounded-3xl border border-blue-400/30 lg:p-8 lg:mb-8 mb-1 p-4">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 lg:w-24 lg:h-24 p-2 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="lg:text-3xl text-lg font-bold text-white lg:mb-2">Username</h1>
              <p className="text-blue-300">email@gmail.com</p>
            </div>
            <div className="text-right">
              <div className="lg:text-4xl text-xl font-bold text-white lg:mb-1 ">{mockModels.length}</div>
              <div className="text-blue-300 lg:text-base text-sm">Созданных моделей</div>
            </div>
          </div>
        </div>


        <div className="flex flex-col flex-1 min-h-0">
          <h2 className="lg:text-2xl text-lg font-bold text-white lg:mb-6 mb-2 flex items-center lg:gap-3 gap-1 shrink-0">
            <Box className="lg:w-7 lg:h-7 w-5 h-5 text-purple-400" />
            Ваши 3D Модели
          </h2>
        
        <div className="flex-1 min-h-0 overflow-y-auto  [scrollbar-width:none]                
        [-ms-overflow-style:none]              
        [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 pb-3
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
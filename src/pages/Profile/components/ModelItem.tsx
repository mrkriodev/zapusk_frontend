import { Box, Calendar, Download } from "lucide-react";
import type { ModelItemProps } from "../../../types/profileTypes";


export default function ModelItem({ model } : ModelItemProps){
    
    return (
      <div
        key={model.id}
        className="bg-blue-900/30 backdrop-blur-md rounded-2xl border border-blue-400/30 p-6 
                    hover:border-blue-400/60 transition-all group"
      >
        <div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 rounded-xl h-40 mb-4 flex items-center justify-center">
          <Box className="w-16 h-16 text-blue-300 group-hover:scale-110 transition-transform" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-3">{model.name}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-blue-300 text-sm">
            <Calendar className="w-4 h-4" />
            {model.date}
          </div>
          <div className="text-blue-300 text-sm">Размер: {model.size}</div>
        </div>

        <button className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
          <Download className="w-4 h-4" />
          Скачать STL
        </button>
      </div>
    );
}
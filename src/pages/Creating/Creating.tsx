import { Plus, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Chat, Message } from "../../types/creatingTypes";
import MessageItem from "./components/MessageItem";
import ChatItem from "./components/ChatItem";


export default function Creating(){

    const [activeChat, setActiveChat] = useState<number>(1)

    const [chats] = useState<Chat[]>([
        { id: 1, name: 'Новый чат', date: '26 Апр' },
        { id: 2, name: 'Шестеренка', date: '25 Апр' },
        { id: 3, name: 'Кронштейн', date: '24 Апр' }
    ])

    const [messages, setMessages] = useState<Message[]>([    
        { id: 1, text: 'Привет! Я AI помощник для создания 3D моделей. Опишите деталь, которую хотите создать, и я сгенерирую STL файл для вас.', isUser: false }
    ])

    const [input, setInput] = useState('')

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
        id: messages.length + 1,
        text: input,
        isUser: true
        };

        const aiResponse: Message = {
        id: messages.length + 2,
        text: `Отлично! Я начинаю создание 3D модели: "${input}". Обработка займет несколько минут...`,
        isUser: false,
        hasFile: true
        };

        setMessages([...messages, userMessage, aiResponse]);
        setInput('');
    };
    

    return(
        <div className="pt-16 h-screen flex flex-col overflow-hidden p-2 bg-linear-to-br bg-[linear-gradient(160deg,_#020617_0%,_#06111f_45%,_#0b1f3a_75%,_#0f2a5f_100%)] ">
            <div className="w-full flex flex-col flex-1 min-h-0 z-10 ">

                <div className="text-center text-white items-center justify-center flex flex-col mt-6">
                    <h1 className="font-bold flex text-3xl">
                        <Sparkles className="w-8 h-8 text-purple-400 mr-4" />
                        Дизайн аэрокосмических деталей
                    </h1>

                    <p className="text-blue-300 text-sm mt-2">Опишите деталь, и получите готовый STL файл</p>
                </div>

                <div className="grid grid-cols-[20fr_69fr] flex-1 min-h-0 pt-7 gap-1 ">

                    <div className="flex flex-col border-2 border-blue-400/20 bg-blue-900/20 p-4 min-h-full rounded-2xl">
                        
                        <button className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                        text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                            <Plus className="w-5 h-5" />
                            Новый чат
                        </button>

                        <ul className="flex-1 overflow-y-auto pt-4 space-y-2 ">
                            {chats.map((item) => {
                                return(
                                    <ChatItem item={item} activeChat={activeChat} setActiveChat={setActiveChat}/>
                                )
                            })}
                        </ul>
                    </div>

                    <div className="flex flex-col min-h-full rounded-2xl border-2 justify-between bg-slate-950 border-blue-400/20">
                        <ul className="border-blue-500 flex-11/12 p-4">

                            {messages.map((message) => (
                                <MessageItem key={message.id} message={message} />
                            ))}
                        </ul>

                        <div className="min-w-full rounded-b-2xl flex bg-blue-900/30 border-t p-3 border-blue-400/20 flex-1/12 gap-3">

                            <input type="text" 
                            value={input}
                            placeholder="Опишите нужную вам деталь"
                            onChange={((e) => setInput(e.target.value))}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-8/10 rbg-blue-800/30 border border-blue-400/30 rounded-full px-6 py-4 text-white placeholder-blue-300/50 focus:outline-none 
                            focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"/>

                            <button 
                            onClick={() => handleSend()}
                            className="flex flex-1/10 items-center  justify-center py-2 rounded-3xl transition-all 
                                                  bg-linear-to-r text-sm from-blue-600 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                                <Send className="w-5 h-5" />
                               
                            </button>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
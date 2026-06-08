import { Menu, Plus, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { Chat, Message } from "../../types/creatingTypes";
import MessageItem from "./components/MessageItem";
import ChatItem from "./components/ChatItem";


export default function Creating(){

    const [activeChat, setActiveChat] = useState<number>(1)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
        }

        setMessages([...messages, userMessage, aiResponse])
        setInput('')
    }
    

    return(
        <div className="h-dvh pt-16 flex flex-col overflow-hidden p-2 bg-linear-to-br bg-[linear-gradient(160deg,_#020617_0%,_#06111f_45%,_#0b1f3a_75%,_#0f2a5f_100%)] ">
            <div className=" flex flex-col flex-1 min-h-0 z-10 ">

                <div className="text-center relative text-white items-center justify-center flex flex-row lg:mt-6 mt-2">

                    <Menu 
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute left-0 w-6 h-6 lg:hidden self-start " 
                    />

                    <div className="flex flex-col items-center">
                        <h1 className="font-bold flex lg:text-3xl items-center sm:text-lg">
                            <Sparkles className="w-4 h-4 text-purple-400 lg:mr-4 mr-1" />
                            Дизайн аэрокосмических деталей
                        </h1>

                        <p className="hidden sm:block text-blue-300 text-xs lg:text-md sm:text-sm lg:mt-2 mt-1">Опишите деталь, и получите готовый STL файл</p>
                    </div>
                </div>

                <div className="relative flex-1 min-h-0 lg:pt-7 pt-3">

                    

                    {isSidebarOpen && (
                        <div
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                        />
                    )}

                     <aside
                        className={`
                            fixed left-0 top-0 z-50 h-full w-72 transform border-r border-blue-400/20 
                            bg-slate-950 p-4 transition-transform duration-300 lg:hidden pt-16
                            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                        `}
                    >
                        <div className="mb-4 flex items-center justify-between pt-2">
                            <h2 className="text-white font-semibold">Чаты</h2>

                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="rounded-lg p-2 text-white hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <button className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                        text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                            <Plus className="w-5 h-5" />
                            Новый чат
                        </button>

                        <ul className="flex-1 overflow-y-auto pt-4 space-y-2">
                            {chats.map((item) => {
                                return (
                                    <ChatItem
                                        key={item.id}
                                        item={item}
                                        activeChat={activeChat}
                                        setActiveChat={(chatId) => {
                                            setActiveChat(chatId)
                                            setIsSidebarOpen(false)
                                        }}
                                    />
                                )
                            })}
                        </ul>
                    </aside>

                    <div className="grid lg:grid-cols-[20fr_69fr] grid-cols-1  min-h-0 h-full gap-1 ">

                        <div className="hidden lg:flex flex-col border-2 border-blue-400/20 bg-blue-900/20 p-4 min-h-full rounded-2xl">
                            
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

                        <div className="flex flex-col h-full min-h-0 rounded-2xl border-2 bg-slate-950 border-blue-400/20 overflow-hidden">
                            <ul className="flex flex-col-reverse flex-1 min-h-0 pt-4 px-4 pb-2 overflow-y-auto">

                                {messages.slice().reverse().map((message) => (
                                    <MessageItem key={message.id} message={message} />
                                ))}
                            </ul>

                            <div className="w-full shrink-0 flex bg-blue-900/30 border-t p-3 border-blue-400/20 gap-3">

                                <input type="text" 
                                value={input}
                                placeholder="Опишите нужную вам деталь"
                                onChange={((e) => setInput(e.target.value))}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="lg:flex-8/10 flex-7/10 bg-blue-800/30 border border-blue-400/30 lg:rounded-3xl rounded-2xl lg:px-6 lg:py-4 px-4 py-2 text-white placeholder-blue-300/50 focus:outline-none 
                                focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 text-sm"/>

                                <button 
                                onClick={() => handleSend()}
                                className="flex lg:flex-1/10 flex-2/10 lg:max-w-50 max-w-25 items-center  justify-center py-2 lg:rounded-3xl rounded-2xl transition-all 
                                                    bg-linear-to-r text-sm from-blue-600 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                                    <Send className="w-5 h-5" />
                                
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
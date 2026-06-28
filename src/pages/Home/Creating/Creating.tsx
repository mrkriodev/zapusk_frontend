import { Menu, Plus, Send, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Chat } from "../../../types/UITypes/creatingTypes";
import ChatItem from "./components/chat/ChatItem";
import MessageItem from "./components/chat/MessageItem";
import DeleteModal from "./components/modals/DeleteModal";
import CreateModal from "./components/modals/CreateModal";
import { useCreateConversationMutation, useDeleteConversationMutation, useGetConservationByIdQuery, useGetConversationsQuery, useSendMessageMutation } from "../../../api/repository/ConversationsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetJobByIdQuery } from "../../../api/repository/JobsApi";


export default function Creating(){

    const { data: conversationsData, isLoading: conversationsLoading, error: conversationsError } = useGetConversationsQuery()
    const chats = conversationsData?.items ?? []

    const [activeChat, setActiveChat] = useState<string | null>(null)
    const {data: conversationsIdData, refetch: refetchConversation,} = useGetConservationByIdQuery(activeChat ?? skipToken)
    const messages = conversationsIdData?.messages ?? []

    useEffect(() => {
        if (chats.length > 0 && !activeChat) {
            setActiveChat(chats[0].id)
        }
    }, [chats, activeChat])

    const [createConversation, ] = useCreateConversationMutation()

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

    const [deleteConversation, ] = useDeleteConversationMutation()

    const [input, setInput] = useState('')

    const [sendMessage, {isLoading: isSendingMessage}] = useSendMessageMutation()

    const handleSend = async () => {
        const text = input.trim();

        if (!text || !activeChat) return;

        try {
            const job = await sendMessage({
                conversationId: activeChat,
                text,
            }).unwrap();

            setInput("");

            setActiveJob({
                jobId: job.job_id,
                conversationId: activeChat,
            });

            refetchConversation();
        } catch (error) {
            console.error("Ошибка отправки сообщения:", error);
        }
    }
    

    const [activeJob, setActiveJob] = useState<{
        jobId: string
        conversationId: string
    } | null>(null)

    const {
        data: jobData,
        
        error: jobError,
    } = useGetJobByIdQuery(activeJob?.jobId ?? skipToken, {
        pollingInterval: activeJob ? 2000 : 0,
        skipPollingIfUnfocused: true,
    })

    useEffect(() => {
        if (!jobData || !activeJob) return;

        const finishedStatuses = ["done", "error"];

        if (finishedStatuses.includes(jobData.status)) {
            setActiveJob(null);

            if (activeChat === activeJob.conversationId) {
                refetchConversation();
            }
        }
    }, [jobData, activeJob, activeChat, refetchConversation]);

    useEffect(() => {
        if (!jobError) return

        console.error("Ошибка polling job:", jobError)
        setActiveJob(null)
    }, [jobError])
    

    const handleDeleteChat = async (chat: Chat) => {
        try {
            await deleteConversation(chat.id).unwrap();

            setChatToDelete(null);
            setIsSidebarOpen(false);

            if (activeChat === chat.id) {
                const nextChat = chats.find((item) => item.id !== chat.id);
                setActiveChat(nextChat?.id ?? null);
            }
        } catch (error) {
            console.error("Ошибка удаления чата:", error);
        }
    };

    const [isModalCreate, setIsModalCreate] = useState<boolean>(false)
    const [newChatName, setNewChatName] = useState("")

    const handleCreateChat = async () => {
        try {
            const newConversation = await createConversation({
                title: newChatName.trim() || "Новый чат",
            }).unwrap()

            setActiveChat(newConversation.id)
        
            setNewChatName("")
            setIsModalCreate(false)
            setIsSidebarOpen(false)

        } catch(error){
            console.error("Ошибка создания чата:", error)
        }
    }

    const handleCancelCreateChat = () => {
        setNewChatName("")
        setIsModalCreate(false)
    }

    const handleSelectChat = (chatId: string) => {
        setActiveChat(chatId)
        setIsSidebarOpen(false)
    }

    return(
        <div className="h-dvh pt-16 flex flex-col overflow-hidden bg-amber-300 p-2 bg-linear-to-br bg-[linear-gradient(160deg,_#020617_0%,_#06111f_45%,_#0b1f3a_75%,_#0f2a5f_100%)] ">
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

                        <button 
                        onClick={() => setIsModalCreate(true)}
                        className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                        text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                            <Plus className="w-5 h-5" />
                            Новый чат
                        </button>

                        <ul className="flex-1 overflow-y-auto pt-4 space-y-2">
                            {conversationsLoading && (
                                <p className="text-blue-300 text-sm">Загрузка чатов...</p>
                            )}

                            {conversationsError && (
                                <p className="text-red-400 text-sm">Ошибка загрузки чатов</p>
                            )}

                            {chats.map((item) => {
                                return (
                                    <ChatItem
                                        key={item.id}
                                        item={item}
                                        activeChat={activeChat}
                                        setActiveChat={handleSelectChat}
                                        onDeleteClick={() => setChatToDelete(item)}
                                    />
                                )
                            })}
                        </ul>
                    </aside>

                    <div className="grid lg:grid-cols-[20fr_69fr] grid-cols-1  min-h-0 h-full gap-1 ">

                        <div className="hidden lg:flex flex-col border-2 border-blue-400/20 bg-blue-900/20 p-4 min-h-full rounded-2xl">
                            
                            <button 
                            onClick={() => setIsModalCreate(true)}
                            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                            text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                                <Plus className="w-5 h-5" />
                                Новый чат
                            </button>

                            <ul className="flex-1 overflow-y-auto pt-4 space-y-2 ">
                                {conversationsLoading && (
                                    <p className="text-blue-300 text-sm">Загрузка чатов...</p>
                                )}

                                {conversationsError && (
                                    <p className="text-red-400 text-sm">Ошибка загрузки чатов</p>
                                )}

                                {chats.map((item) => {
                                    return(
                                        <ChatItem key={item.id} item={item} activeChat={activeChat} setActiveChat={handleSelectChat} onDeleteClick={() => setChatToDelete(item)}/>
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
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isSendingMessage || !activeChat || !!activeJob}
                                    className="lg:flex-8/10 flex-7/10 bg-blue-800/30 border border-blue-400/30 lg:rounded-3xl rounded-2xl lg:px-6 lg:py-4 px-4 py-2 text-white placeholder-blue-300/50 focus:outline-none 
                                focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 text-base"
                                />

                                <button 
                                onClick={handleSend}
                                disabled={isSendingMessage || !activeChat || !input.trim() || !!activeJob}
                                className="flex lg:flex-1/10 flex-2/10 lg:max-w-50 max-w-25 items-center  justify-center py-2 lg:rounded-3xl rounded-2xl transition-all 
                                                    bg-linear-to-r text-sm from-blue-600 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                                    <Send className="w-5 h-5" />
                                
                                </button>

                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {chatToDelete && (
                <DeleteModal
                    chat={chatToDelete}
                    onCancel={() => setChatToDelete(null)}
                    onConfirm={() => { handleDeleteChat(chatToDelete)}}
                />
            )}

            {isModalCreate && (
                <CreateModal 
                    value={newChatName}
                    onChange={setNewChatName}
                    onCancel={handleCancelCreateChat}
                    onConfirm={handleCreateChat}
                />
            )}
        </div> 
    )
}
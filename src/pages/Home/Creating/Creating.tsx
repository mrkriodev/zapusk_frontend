import { Menu, Plus, Send, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import type { CadModel, Chat } from "../../../types/UITypes/creatingTypes";
import type { Message } from "../../../types/apiTypes/MessageTypes";
import type { CadDownloadFormat, EngineParams } from "../../../types/apiTypes/CadTypes";
import ChatItem from "./components/chat/ChatItem";
import ErrorMessage from "./components/chat/ErrorMessage";
import LoadingMessage from "./components/chat/LoadingMessage";
import MessageItem from "./components/chat/MessageItem";
import DeleteModal from "./components/modals/DeleteModal";
import CreateModal from "./components/modals/CreateModal";
import ParamsModal from "./components/modals/ParamsModal";
import {
  useChatWithAssistantMutation,
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useGenerateConversationMutation,
  useGetConservationByIdQuery,
  useGetConversationsQuery,
} from "../../../api/repository/ConversationsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetJobByIdQuery } from "../../../api/repository/JobsApi";
import {
  useGetCadVersionsQuery,
  useLazyDownloadCadFileQuery,
} from "../../../api/repository/CadApi";
import CadModalList from "./components/modals/CadModalList";

export default function Creating() {
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useGetConversationsQuery();
  const chats = useMemo(
    () => conversationsData?.items ?? [],
    [conversationsData?.items],
  );

  const [selectedChat, setActiveChat] = useState<string | null>(null);
  const activeChat = selectedChat ?? chats[0]?.id ?? null;
  const { data: conversationsIdData, refetch: refetchConversation } =
    useGetConservationByIdQuery(activeChat ?? skipToken);
  const messages = conversationsIdData?.messages ?? [];
  const { data: cadVersionsData } = useGetCadVersionsQuery(
    activeChat ?? skipToken,
  );

  const [createConversation] = useCreateConversationMutation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [modelsPopoverChatId, setModelsPopoverChatId] = useState<string | null>(
    null,
  );
  const modelsPopoverRef = useRef<HTMLDivElement | null>(null);

  const [deleteConversation] = useDeleteConversationMutation();

  const [input, setInput] = useState("");
  const [paramsInput, setParamsInput] = useState("");
  const [assistantDraftParams, setAssistantDraftParams] =
    useState<EngineParams | null>(null);

  const [chatWithAssistant, { isLoading: isAssistantLoading }] =
    useChatWithAssistantMutation();
  const [generateConversation, { isLoading: isGeneratingRequest }] =
    useGenerateConversationMutation();
  const [downloadCadFileTrigger, { isFetching: isDownloadingCadFile }] =
    useLazyDownloadCadFileQuery();
  const [downloadingCadItemId, setDownloadingCadItemId] = useState<
    string | null
  >(null);
  const { data: modalCadVersionsData, isLoading: isModalCadVersionsLoading } =
    useGetCadVersionsQuery(modelsPopoverChatId ?? skipToken);

  const handleSend = async () => {
    const text = input.trim();

    if (!text || !activeChat) return;

    try {
      setJobFailure((current) =>
        current?.conversationId === activeChat ? null : current,
      );

      const job = await generateConversation({
        conversationId: activeChat,
        text,
        ...(assistantDraftParams ? { params: assistantDraftParams } : {}),
      }).unwrap();

      setInput("");

      setActiveJob({
        jobId: job.job_id,
        conversationId: activeChat,
      });
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  };

  const handleAssistantSubmit = async () => {
    const text = paramsInput.trim();

    if (!text || !activeChat) return;

    try {
      const response = await chatWithAssistant({
        conversationId: activeChat,
        text,
      }).unwrap();

      setAssistantDraftParams(response.draft_params);
      setParamsInput("");
      setShowParamsModal(false);
    } catch (error) {
      console.error("Ошибка уточнения параметров:", error);
    }
  };

  const JOB_POLL_TIMEOUT_MS = 160_000;

  const [activeJob, setActiveJob] = useState<{
    jobId: string;
    conversationId: string;
  } | null>(null);
  const [jobFailure, setJobFailure] = useState<{
    conversationId: string;
    message: string;
  } | null>(null);

  const canPollJob = Boolean(activeJob);

  const { data: jobData, error: jobError } = useGetJobByIdQuery(
    activeJob?.jobId ?? skipToken,
    {
      pollingInterval: canPollJob ? 2000 : 0,
      skipPollingIfUnfocused: true,
    },
  );

  useEffect(() => {
    if (!activeJob) return;

    const timeoutId = window.setTimeout(() => {
      console.error("Превышен лимит polling job по времени");
      setJobFailure({
        conversationId: activeJob.conversationId,
        message:
          "Генерация заняла слишком много времени. Попробуйте уточнить запрос и запустить её снова.",
      });
      setActiveJob(null);
      refetchConversation();
    }, JOB_POLL_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeJob, refetchConversation]);

  useEffect(() => {
    if (!jobError) return;

    console.error("Ошибка polling job:", jobError);
    if (activeJob) {
      setJobFailure({
        conversationId: activeJob.conversationId,
        message:
          "Не удалось получить статус генерации. Попробуйте запустить задачу ещё раз.",
      });
    }
    setActiveJob(null);
  }, [jobError, activeJob]);

  useEffect(() => {
    if (!jobData || !activeJob) return;

    if (jobData.status === "done") {
      setJobFailure((current) =>
        current?.conversationId === activeJob.conversationId ? null : current,
      );
      setActiveJob(null);

      if (activeChat === activeJob.conversationId) {
        refetchConversation();
      }

      return;
    }

    if (jobData.status === "error") {
      setJobFailure({
        conversationId: activeJob.conversationId,
        message:
          jobData.error ??
          "Во время генерации произошла ошибка. Уточните запрос и попробуйте снова.",
      });
      setActiveJob(null);

      if (activeChat === activeJob.conversationId) {
        refetchConversation();
      }
    }
  }, [jobData, activeJob, activeChat, refetchConversation]);

  const handleDeleteChat = async (chat: Chat) => {
    try {
      await deleteConversation(chat.id).unwrap();

      setChatToDelete(null);
      setIsSidebarOpen(false);
      setModelsPopoverChatId((current) =>
        current === chat.id ? null : current,
      );

      if (activeChat === chat.id) {
        const nextChat = chats.find((item) => item.id !== chat.id);
        setActiveChat(nextChat?.id ?? null);
      }
    } catch (error) {
      console.error("Ошибка удаления чата:", error);
    }
  };

  const [isModalCreate, setIsModalCreate] = useState<boolean>(false);
  const [showParamsModal, setShowParamsModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");

  const handleCreateChat = async () => {
    try {
      const newConversation = await createConversation({
        title: newChatName.trim() || "Новый чат",
      }).unwrap();

      setActiveChat(newConversation.id);

      setNewChatName("");
      setIsModalCreate(false);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Ошибка создания чата:", error);
    }
  };

  const handleCancelCreateChat = () => {
    setNewChatName("");
    setIsModalCreate(false);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setIsSidebarOpen(false);
    setModelsPopoverChatId(null);
  };

  useEffect(() => {
    setAssistantDraftParams(null);
    setParamsInput("");
  }, [activeChat]);

  useEffect(() => {
    if (!modelsPopoverChatId) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (modelsPopoverRef.current?.contains(event.target as Node)) return;

      setModelsPopoverChatId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [modelsPopoverChatId]);

  const modelsPopoverChat = chats.find(
    (chat) => chat.id === modelsPopoverChatId,
  );
  const hasChats = chats.length > 0;
  const isWaitingForMessage = Boolean(
    activeJob && activeJob.conversationId === activeChat,
  );
  const isGeneratingModel = Boolean(activeJob);
  const showEmptyChatsState =
    !conversationsLoading && !conversationsError && !hasChats;
  const inputPlaceholder = isGeneratingModel
    ? "Идет генерация модели"
    : "Опишите нужную вам деталь";
  const cadVersionByCadStateId = useMemo(() => {
    const items = cadVersionsData?.items ?? [];

    return new Map(items.map((item) => [item.id, item.version]));
  }, [cadVersionsData?.items]);
  const cadVersionByMessageId = useMemo(() => {
    const items = cadVersionsData?.items ?? [];

    return new Map(items.map((item) => [item.message_id, item.version]));
  }, [cadVersionsData?.items]);
  const cadModalModels = useMemo(() => {
    const items = modalCadVersionsData?.items ?? [];

    return items.flatMap((item) => {
      const formattedTime = new Date(item.created_at).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const files: CadModel[] = [];

      if (item.files.stl) {
        files.push({
          id: `${item.id}-stl`,
          conversationId: item.conversation_id,
          version: item.version,
          format: "stl",
          fileName: `model-v${item.version}.stl`,
          name: `Модель v${item.version}.stl`,
          time: `STL · ${formattedTime}`,
        });
      }

      if (item.files.step) {
        files.push({
          id: `${item.id}-step`,
          conversationId: item.conversation_id,
          version: item.version,
          format: "step",
          fileName: `model-v${item.version}.step`,
          name: `Модель v${item.version}.step`,
          time: `STEP · ${formattedTime}`,
        });
      }

      return files;
    });
  }, [modalCadVersionsData?.items]);

  const handleDownloadCadFile = async ({
    id,
    conversationId,
    version,
    format,
    fileName,
  }: {
    id: string;
    conversationId: string;
    version: number;
    format: CadDownloadFormat;
    fileName: string;
  }) => {
    try {
      setDownloadingCadItemId(id);

      const blob = await downloadCadFileTrigger({
        conversationId,
        version,
        format,
      }).unwrap();

      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Ошибка скачивания CAD-файла:", error);
    } finally {
      setDownloadingCadItemId(null);
    }
  };

  const handleDownloadMessageCadFile = async (message: Message) => {
    if (!activeChat) return;

    let version;

    if (message.cad_state_id && conversationsIdData?.current_cad?.id === message.cad_state_id) {
        version = conversationsIdData.current_cad.version;
    }

    if (!version) {
      console.error("Не найдена CAD-версия для сообщения:", message.id);
      return;
    }

    await handleDownloadCadFile({
      id: message.id,
      conversationId: activeChat,
      version,
      format: "stl",
      fileName: `model-v${version}.stl`,
    });
  };

  return (
    <div className="h-dvh pt-16 flex flex-col overflow-hidden bg-amber-300 p-2 bg-linear-to-br bg-[linear-gradient(160deg,_#020617_0%,_#06111f_45%,_#0b1f3a_75%,_#0f2a5f_100%)] ">
      <div className=" flex flex-col flex-1 min-h-0 z-10 ">
        <div className="text-center relative text-white items-center justify-center flex flex-row lg:mt-6 mt-2">
          <Menu
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-0 w-6 h-6 lg:hidden self-start "
          />

          <div className="flex flex-col items-center">
            <h1 className="font-bold flex lg:text-3xl items-center sm:text-lg">
              <Sparkles className="w-4 h-4 lg:w-6 lg:h-6 text-purple-400 lg:mr-2 mr-1" />
              Дизайн аэрокосмических деталей
            </h1>

            <p className="hidden sm:block text-blue-300 text-xs lg:text-md sm:text-sm lg:mt-2 mt-1">
              Опишите деталь, и получите готовый STL файл
            </p>
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
                        text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
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
                    onModelsClick={() => setModelsPopoverChatId(item.id)}
                  />
                );
              })}
            </ul>
          </aside>

          <div className="grid lg:grid-cols-[20fr_69fr] grid-cols-1  min-h-0 h-full gap-1 ">
            <div className="hidden lg:flex flex-col border-2 border-blue-400/20 bg-blue-900/20 p-4 min-h-full rounded-2xl">
              <button
                onClick={() => setIsModalCreate(true)}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                            text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
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
                  return (
                    <ChatItem
                      key={item.id}
                      item={item}
                      activeChat={activeChat}
                      setActiveChat={handleSelectChat}
                      onDeleteClick={() => setChatToDelete(item)}
                      onModelsClick={() => setModelsPopoverChatId(item.id)}
                    />
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col h-full min-h-0 rounded-2xl border-2 bg-slate-950 border-blue-400/20 overflow-hidden">
              {showEmptyChatsState ? (
                <div className="flex flex-1 items-center justify-center px-6 text-center">
                  <p className="max-w-md text-sm leading-relaxed text-blue-200 lg:text-base">
                    У вас пока нет чатов, создайте новый и начните генерировать!
                  </p>
                </div>
              ) : (
                <>
                  <ul className="flex flex-col-reverse flex-1 min-h-0 pt-4 px-4 pb-2 overflow-y-auto">
                    {isWaitingForMessage && <LoadingMessage />}

                    {jobFailure?.conversationId === activeChat && (
                      <ErrorMessage message={jobFailure.message} />
                    )}

                    {messages
                      .slice()
                      .reverse()
                      .map((message) => (
                        <MessageItem
                          key={message.id}
                          message={message}
                          onDownloadCadFile={handleDownloadMessageCadFile}
                          isDownloading={
                            isDownloadingCadFile &&
                            downloadingCadItemId === message.id
                          }
                        />
                      ))}
                  </ul>

                  <div className="w-full shrink-0 flex bg-blue-900/30 border-t p-3 border-blue-400/20 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowParamsModal(true)}
                      disabled={!activeChat || isGeneratingModel}
                      className="shrink-0 lg:rounded-full rounded-2xl border border-purple-400/40 bg-purple-500/10 px-3 py-3 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/20 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-60 md:px-4 md:py-4 flex items-center gap-1.5"
                      title="Уточнить параметры"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span className="hidden sm:inline">Уточнить</span>
                    </button>

                    <input
                      type="text"
                      value={input}
                      placeholder={inputPlaceholder}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={
                        isGeneratingRequest || !activeChat || !!activeJob
                      }
                      className="lg:flex-8/10 flex-7/10 bg-blue-800/30 border border-blue-400/30 lg:rounded-3xl rounded-2xl lg:px-6 lg:py-4 px-4 py-2 text-white placeholder-blue-300/50 focus:outline-none 
                                        focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 text-base"
                    />

                    <button
                      onClick={handleSend}
                      disabled={
                        isGeneratingRequest ||
                        !activeChat ||
                        !input.trim() ||
                        !!activeJob
                      }
                      className="flex lg:flex-1/10 flex-2/10 lg:max-w-50 max-w-25 items-center  justify-center py-2 lg:rounded-3xl rounded-2xl transition-all 
                                                            bg-linear-to-r text-sm from-blue-600 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {chatToDelete && (
        <DeleteModal
          chat={chatToDelete}
          onCancel={() => setChatToDelete(null)}
          onConfirm={() => {
            handleDeleteChat(chatToDelete);
          }}
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

      {showParamsModal && (
        <ParamsModal
          value={paramsInput}
          isSubmitting={isAssistantLoading}
          onChange={setParamsInput}
          onSubmit={handleAssistantSubmit}
          onClose={() => setShowParamsModal(false)}
        />
      )}

      {modelsPopoverChat && (
        <CadModalList
          models={cadModalModels}
          isLoading={isModalCadVersionsLoading}
          isDownloadingId={isDownloadingCadFile ? downloadingCadItemId : null}
          onDownload={handleDownloadCadFile}
          onClose={() => setModelsPopoverChatId(null)}
          popoverRef={modelsPopoverRef}
        />
      )}
    </div>
  );
}

import { Menu, Plus, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import type { CadVersionModel, Chat } from "../../../types/UITypes/creatingTypes";
import type { Message } from "../../../types/apiTypes/MessageTypes";
import type { CadDownloadFormat } from "../../../types/apiTypes/CadTypes";
import ChatItem from "./components/chat/ChatItem";
import ErrorMessage from "./components/chat/ErrorMessage";
import LoadingMessage from "./components/chat/LoadingMessage";
import MessageItem from "./components/chat/MessageItem";
import DeleteModal from "./components/modals/DeleteModal";
import CreateModal from "./components/modals/CreateModal";
import GenerateModal from "./components/modals/GenerateModal";
import {
  conversationApi,
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useGetConservationByIdQuery,
  useGetConversationsQuery,
} from "../../../api/repository/ConversationsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetJobByIdQuery } from "../../../api/repository/JobsApi";
import {
  cadApi,
  useGetCadVersionsQuery,
  useLazyDownloadCadFileQuery,
} from "../../../api/repository/CadApi";
import CadModalList from "./components/modals/CadModalList";
import FemReports from "./components/fem/FemReports";
import { useConversationFem } from "./hooks/useConversationFem";
import { useConversationChat } from "./hooks/useConversationChat";
import { JOB_POLL_TIMEOUT_MS } from "../../../constants/constants";
import { InputSendLine } from "./components/chat/InputSendLine";
import { baseApi } from "../../../api/baseApi";
import type { AppDispatch } from "../../../store/store";
import { useGetCapabilitiesQuery } from "../../../api/repository/FemApi";
import { useProductSelection } from "./hooks/useProductSelection";
import CatalogWelcome, { CatalogHints } from "./components/catalog/CatalogWelcome";
import CadResultCard from "./components/cad/CadResultCard";
import CadJobCard from "./components/cad/CadJobCard";
import CadReportModal from "./components/cad/CadReportModal";
import ModelParamsViewer from "./components/cad/ModelParamsViewer";
import { cadKey, isCadState, mergeCadVersions } from "./components/cad/cadPresentation";
import type { CadPresentation } from "./components/cad/cadPresentation";


export default function Creating() {
  const dispatch = useDispatch<AppDispatch>();
  // гет и мемо список чатов
  const { data: conversationsData, isLoading: conversationsLoading, error: conversationsError} = useGetConversationsQuery();
  const chats = useMemo(
    () => conversationsData?.items ?? [],
    [conversationsData?.items],
  );

  // стейт для селекта чата + тянем сообщения + все кады
  const [selectedChat, setActiveChat] = useState<string | null>(null);
  const activeChat = selectedChat ?? chats[0]?.id ?? null;
  const { currentData: conversationsIdData } = useGetConservationByIdQuery(activeChat ?? skipToken);
  const messages = useMemo(() => conversationsIdData?.messages ?? [], [conversationsIdData?.messages]);
  const { currentData: cadVersionsData } = useGetCadVersionsQuery(activeChat ?? skipToken);

  const capabilities = useGetCapabilitiesQuery();
  const selection = useProductSelection(conversationsIdData, capabilities.data?.products);
  const [cadResults, setCadResults] = useState<Record<string, CadPresentation>>({});
  const [reportPresentation, setReportPresentation] = useState<CadPresentation | null>(null);
  const cadVersions = useMemo(() => mergeCadVersions(activeChat,
    cadVersionsData?.items ?? [], [conversationsIdData?.current_cad],
    Object.values(cadResults).map((item) => item.cad)), [activeChat, cadVersionsData?.items, conversationsIdData?.current_cad, cadResults]);
  const currentCad = cadVersions.at(-1) ?? conversationsIdData?.current_cad;
  const presentationFor = (cad: typeof cadVersions[number]): CadPresentation => ({
    ...cadResults[cadKey(cad)], cad, notes: cadResults[cadKey(cad)]?.notes ?? [],
  });

  // post создаем чат
  const [createConversation] = useCreateConversationMutation();

  // сайд бар дл мобилок
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // стейт и запрос для удаления чата
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [deleteConversation] = useDeleteConversationMutation();

  // стейт и реф для модалки списка кадов
  const [modelsPopoverChatId, setModelsPopoverChatId] = useState<string | null>(null);
  const modelsPopoverRef = useRef<HTMLDivElement | null>(null);

  const chatListRef = useRef<HTMLUListElement>(null);
  const followMessages = useRef(true);
  const previousChat = useRef(activeChat);

  const [input, setInput] = useState(""); // стейт для строки ввода
  // гет и стейт загрузка cad файла
  const [downloadCadFileTrigger, { isFetching: isDownloadingCadFile }] = useLazyDownloadCadFileQuery();
  const [paramsTarget, setParamsTarget] = useState<{ conversationId: string; version: number; productId?: string } | null>(null);
  const [downloadingCadItemId, setDownloadingCadItemId] = useState<string | null>(null);
  
  // гет списка всех кадов
  const { currentData: modalCadVersionsData, isLoading: isModalCadVersionsLoading } = useGetCadVersionsQuery(modelsPopoverChatId ?? skipToken);

  // стейты для поллинга
  const [activeJob, setActiveJob] = useState<{jobId: string; conversationId: string; paused?: boolean;} | null>(null);
  const [jobFailure, setJobFailure] = useState<{conversationId: string; message: string;} | null>(null);
  const canPollJob = Boolean(activeJob && !activeJob.paused);
  const [readingCad, setReadingCad] = useState(false);
  const startJob = useCallback((jobId: string, conversationId: string) => {
    setJobFailure((current) => current?.conversationId === conversationId ? null : current);
    setActiveJob({ jobId, conversationId });
  }, []);
  const dialog = useConversationChat(activeChat, startJob);
  const { continueAfterJob, getApprovedDraft } = dialog;
  const cadBusy = dialog.busy || dialog.queueBusy || Boolean(activeJob);
  const fem = useConversationFem(activeChat, currentCad, cadBusy, startJob, selection.productId);


  // хук поллинга сообщения
  const {
    currentData: jobData,
    error: jobError,
    isError: isJobError,
    isFetching: isJobFetching,
    refetch: refetchJob,
  } = useGetJobByIdQuery(
    activeJob?.jobId ?? skipToken,
    {
      pollingInterval: canPollJob ? 2000 : 0,
      skipPollingIfUnfocused: true,
    },
  );

  const refreshCompletedConversation = useCallback((conversationId: string) => {
    dispatch(
      baseApi.util.invalidateTags([
        "Conversations",
        { type: "Messages", id: conversationId },
        { type: "Cad", id: conversationId },
      ]),
    );
  }, [dispatch]);

  // юзеффект таймер поллинга
  useEffect(() => {
    if (!activeJob || activeJob.paused) return;

    const timeoutId = window.setTimeout(() => {
      console.error("Превышен лимит polling job по времени");
      setJobFailure({
        conversationId: activeJob.conversationId,
        message:
          "Наблюдение за CAD приостановлено по времени. Обновите статус той же задачи.",
      });
      setActiveJob({ ...activeJob, paused: true });
    }, JOB_POLL_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeJob, refreshCompletedConversation]);

  // юзеффект ошибки поллинга
  useEffect(() => {
    if (!activeJob || activeJob.paused || !isJobError || !jobError) return;

    console.error("Ошибка polling job:", jobError);
    const failureTimeoutId = window.setTimeout(() => {
      setJobFailure({
        conversationId: activeJob.conversationId,
        message:
          "Не удалось получить статус CAD. Можно повторить чтение этой задачи.",
      });
      setActiveJob({ ...activeJob, paused: true });
    }, 0);

    return () => window.clearTimeout(failureTimeoutId);
  }, [jobError, isJobError, activeJob, refreshCompletedConversation]);

  // юзеффект отслеживания статуса поллинга
  useEffect(() => {
    if (!jobData || !activeJob || activeJob.paused || isJobFetching || jobData.id !== activeJob.jobId) return;

    if (jobData.status === "done") {
      const completionTimeoutId = window.setTimeout(() => {
        const cad = jobData.result?.cad_state;
        if (jobData.kind === 'fem' || jobData.conversation_id !== activeJob.conversationId || !isCadState(cad, activeJob.conversationId)) {
          setJobFailure({ conversationId: activeJob.conversationId, message: 'Задача завершена, но сервер не вернул корректный CAD-результат. Обновите ответ задачи.' });
          setActiveJob({ ...activeJob, paused: true });
          return;
        }
        setCadResults((items) => ({ ...items, [cadKey(cad)]: {
          cad, notes: jobData.result?.notes ?? [], confirmedDraft: getApprovedDraft(activeJob.jobId),
        } }));
        dispatch(cadApi.util.updateQueryData('getCadVersions', cad.conversation_id, (cached) => {
          const index = cached.items.findIndex((item) => item.version === cad.version);
          if (index < 0) cached.items.push(cad);
          else cached.items[index] = cad;
          cached.current_version = Math.max(cached.current_version ?? 0, cad.version);
        }));
        dispatch(conversationApi.util.updateQueryData('getConservationById', cad.conversation_id, (cached) => {
          if (!cached.current_cad || cached.current_cad.version <= cad.version) {
            cached.current_cad = cad;
            cached.current_version = cad.version;
          }
          const assistant = jobData.result?.assistant_message;
          if (assistant && !cached.messages.some((message) => message.id === assistant.id)) cached.messages.push(assistant);
        }));
        setJobFailure((current) => current?.conversationId === activeJob.conversationId ? null : current);
        setActiveJob(null);
        refreshCompletedConversation(activeJob.conversationId);
        void continueAfterJob(activeJob.conversationId, activeJob.jobId);
      }, 0);
      return () => window.clearTimeout(completionTimeoutId);
    }

    if (jobData.status === "error") {
      const failureTimeoutId = window.setTimeout(() => {
        setJobFailure({
          conversationId: activeJob.conversationId,
          message:
            jobData.error ??
            "Во время генерации произошла ошибка. Уточните запрос и попробуйте снова.",
        });
        setActiveJob(null);
        refreshCompletedConversation(activeJob.conversationId);
        void continueAfterJob(activeJob.conversationId, activeJob.jobId);
      }, 0);

      return () => window.clearTimeout(failureTimeoutId);
    }
  }, [jobData, activeJob, isJobFetching, refreshCompletedConversation, continueAfterJob, getApprovedDraft, dispatch]);

  // функция удаления чата
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
        dialog.hideForNavigation();
        setActiveChat(nextChat?.id ?? null);
      }
    } catch (error) {
      console.error("Ошибка удаления чата:", error);
    }
  };

  const [isModalCreate, setIsModalCreate] = useState<boolean>(false); // стейт показа модалки создания чата 
  const [newChatName, setNewChatName] = useState(""); // стейт имя нового чата

  // коллбек создания чата
  const handleCreateChat = async () => {
    try {
      const newConversation = await createConversation({
        title: newChatName.trim() || "Новый чат",
      }).unwrap();

      dialog.hideForNavigation();
      setActiveChat(newConversation.id);

      setNewChatName("");
      setIsModalCreate(false);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Ошибка создания чата:", error);
    }
  };
  // коллбек отмены создания чата
  const handleCancelCreateChat = () => {
    setNewChatName("");
    setIsModalCreate(false);
  };

  // коллбек открытия чата
  const handleSelectChat = (chatId: string) => {
    dialog.hideForNavigation();
    setActiveChat(chatId);
    setIsSidebarOpen(false);
    setModelsPopoverChatId(null);
  };

  // 
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

  // чат для которого тнужно найти все кады
  const modelsPopoverChat = chats.find((chat) => chat.id === modelsPopoverChatId);
  const hasChats = chats.length > 0;

  // флаги для поллинга 
  const isWaitingForMessage = Boolean(
    activeChat &&
      dialog.pendingConversationId === activeChat,
  );
  const isGeneratingModel = Boolean(activeJob);
  const isInputBusy = cadBusy || fem.busy;

  const handleAssistantSubmit = () => {
    if (isInputBusy || !selection.canEnter) return;
    if (dialog.submit(input, selection.firstProductId)) {
      selection.markSubmitted();
      setInput("");
    }
  };
  const handleGenerate = () => {
    if (!isInputBusy) dialog.confirm();
  };
  const optimisticMessage = dialog.optimisticMessage;

  const showEmptyChatsState = !conversationsLoading && !conversationsError && !hasChats; // флаг отсутствия чатов
  const inputPlaceholder = isGeneratingModel ? "Идет генерация модели" : "Опишите нужную вам деталь";

  const saveBlob = (blob: Blob, fileName: string) => {
    const fileUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(fileUrl);
  };

  const handleOpenModelParams = () => {
    if (!activeChat || !currentCad?.files.model_params) return;
    setParamsTarget({ conversationId: activeChat, version: currentCad.version, productId: currentCad.params.product_id ?? 'engine_assembly' });
  };

  // Реальные CAD-версии диалога, возвращаемые backend.
  const cadModalModels = useMemo(() => {
    const items = mergeCadVersions(modelsPopoverChatId, modalCadVersionsData?.items ?? [], Object.values(cadResults).map((item) => item.cad));
    return items.map((item): CadVersionModel => ({ cad: item, id: item.id, conversationId: item.conversation_id, version: item.version, createdAt: item.created_at, hasStl: Boolean(item.files.stl), hasStep: Boolean(item.files.step), hasModelParams: Boolean(item.files.model_params) }));
  }, [modelsPopoverChatId, modalCadVersionsData?.items, cadResults]);

  const retryCad = async () => {
    if (!activeJob || readingCad) return;
    const id = activeJob.jobId;
    setReadingCad(true);
    try {
      await refetchJob().unwrap();
      setJobFailure(null);
      setActiveJob((current) => current?.jobId === id ? { ...current, paused: false } : current);
    } catch {
      setJobFailure({ conversationId: activeJob.conversationId, message: 'Не удалось обновить CAD-задачу. Повторите чтение, когда восстановится связь.' });
    } finally { setReadingCad(false); }
  };

  const timeline = useMemo(() => {
    const events: ({ key: string; time: number; order: number } & ({ type: 'message'; message: Message } | { type: 'cad'; cad: typeof cadVersions[number] }))[] = messages.map((message, index) => ({ key: `message-${message.id}`, type: 'message', message, time: new Date(message.created_at).getTime() || 0, order: index * 2 }));
    for (const cad of cadVersions) {
      const index = messages.findIndex((message) => message.cad_state_id === cad.id || message.id === cad.message_id);
      events.push({ key: `cad-${cadKey(cad)}`, type: 'cad', cad,
        time: new Date(index >= 0 ? messages[index].created_at : cad.created_at).getTime() || 0,
        order: index >= 0 ? index * 2 + 1 : messages.length * 2 });
    }
    return events.sort((a, b) => a.time - b.time || a.order - b.order);
  }, [messages, cadVersions]);

  useLayoutEffect(() => {
    const list = chatListRef.current;
    if (!list) return;
    const switched = previousChat.current !== activeChat;
    previousChat.current = activeChat;
    if (switched) followMessages.current = true;
    if (messages.length === 0 && !optimisticMessage && !currentCad) {
      list.scrollTop = 0;
    } else if (followMessages.current) {
      list.scrollTop = list.scrollHeight;
    }
  }, [activeChat, timeline, optimisticMessage, isWaitingForMessage, messages.length, currentCad]);

  // 
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

      const downloadedFile = await downloadCadFileTrigger({
        conversationId,
        version,
        format,
      }).unwrap();

      saveBlob(downloadedFile.blob, downloadedFile.fileName ?? fileName);
    } catch (error) {
      console.error("Ошибка скачивания CAD-файла:", error);
    } finally {
      setDownloadingCadItemId(null);
    }
  };

  const handleDownloadMessageCadFile = async (message: Message) => {
  if (!activeChat) return;

  let version: number | undefined;

  if (message.cad_state_id && conversationsIdData?.current_cad?.id === message.cad_state_id) {
    version = conversationsIdData.current_cad.version;
  }

  if (!version && cadVersionsData?.items) {
    const byCadState = cadVersionsData.items.find(
      item => item.id === message.cad_state_id
    );
    if (byCadState) {
      version = byCadState.version;
    }
    
    if (!version) {
      const byMessage = cadVersionsData.items.find(
        item => item.message_id === message.id
      );
      if (byMessage) {
        version = byMessage.version;
      }
    }
  }

  if (!version) {
    console.error("Не найдена CAD-версия для сообщения:", message.id);
    return;
  }

  await handleDownloadCadFile({
    id: message.id,
    conversationId: message.conversation_id || activeChat,
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
                  {(messages.length > 0 || currentCad) && selection.product && <div className="shrink-0 px-4 pt-3"><CatalogHints product={selection.product} engine={capabilities.data?.products.find((item) => item.id === 'engine_assembly')} /></div>}
                  <ul ref={chatListRef} onScroll={(event) => {
                    const list = event.currentTarget;
                    followMessages.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
                  }} className="flex flex-col flex-1 min-h-0 pt-4 px-4 pb-2 overflow-y-auto">
                    {messages.length === 0 && !currentCad && <CatalogWelcome
                      products={capabilities.data?.products} product={selection.product}
                      canChoose={selection.canChoose && !dialog.busy} loading={capabilities.isLoading || selection.loading}
                      error={capabilities.isError} onChoose={selection.choose} onRetry={() => void capabilities.refetch()}
                    />}
                    {timeline.map((event) => event.type === 'cad' ? (
                      <li key={event.key} className="mb-3 w-full max-w-3xl"><CadResultCard presentation={presentationFor(event.cad)} products={capabilities.data?.products} /></li>
                    ) : (
                      <MessageItem key={event.key} message={event.message} onDownloadCadFile={handleDownloadMessageCadFile} isDownloading={isDownloadingCadFile && downloadingCadItemId === event.message.id} />
                    ))}
                    {optimisticMessage?.conversation_id === activeChat && (
                      <MessageItem message={optimisticMessage} />
                    )}

                    <FemReports fem={fem} conversationId={activeChat} />
                    {isWaitingForMessage && <LoadingMessage />}
                    {activeJob?.conversationId === activeChat && <CadJobCard job={jobData} paused={Boolean(activeJob.paused)} error={jobFailure?.conversationId === activeChat ? jobFailure.message : undefined} reading={readingCad} onRetry={() => void retryCad()} />}
                    {dialog.notice && <li role="status" className="mb-3 rounded-xl border border-blue-400/30 bg-slate-900 p-3 text-sm text-blue-200">{dialog.notice}</li>}
                    {dialog.failures.filter(({ turn }) => turn.request.request_id !== dialog.prompt?.requestId).map(({ turn, message, retryable }) => (
                      <li key={turn.request.request_id} role="alert" className="mb-3 max-w-3xl rounded-xl border border-red-400/30 bg-slate-900 p-3 text-sm text-red-200">
                        <p>{message}</p>
                        {retryable && <button type="button" disabled={isInputBusy} onClick={() => dialog.retry(turn.request.request_id)} className="mt-2 rounded-lg border border-blue-400/30 px-3 py-2 text-blue-100 disabled:opacity-40">Повторить</button>}
                      </li>
                    ))}

                    {jobFailure?.conversationId === activeChat && !activeJob && (
                      <ErrorMessage message={jobFailure.message} />
                    )}


                  </ul>

                  <div className="relative shrink-0">
                    {dialog.prompt && (!isInputBusy || dialog.isConfirming) && (
                      <GenerateModal
                        key={activeChat}
                        isSubmitting={dialog.isConfirming}
                        error={dialog.promptError}
                        draft={dialog.prompt.draft}
                        notice={dialog.prompt.notice}
                        retryLabel={dialog.promptHasFailed && dialog.promptCanRetry}
                        canConfirm={Boolean(dialog.prompt.draft.ready_to_generate) && (!dialog.promptHasFailed || dialog.promptCanRetry)}
                        onCancel={dialog.dismiss}
                        onConfirm={handleGenerate}
                      />
                    )}
                    <InputSendLine
                      value={input}
                      placeholder={inputPlaceholder}
                      onChange={setInput}
                      onAssistantSubmit={handleAssistantSubmit}
                      isAssistantDisabled={
                        isInputBusy || !activeChat || !selection.canEnter || !input.trim()
                      }
                      isInputDisabled={isInputBusy || !activeChat || !selection.canEnter}
                      needsAssistantPrompt={messages.length === 0}
                      canViewModelParams={Boolean(currentCad?.files.model_params)}
                      canStartFem={fem.canStart}
                      showFem={fem.visible}
                      femDisabledReason={fem.reason}
                      isStartingFem={fem.starting}
                      onStartFem={fem.start}
                      onOpenModelParams={handleOpenModelParams}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {paramsTarget && <ModelParamsViewer key={`${paramsTarget.conversationId}:${paramsTarget.version}`} {...paramsTarget} products={capabilities.data?.products} onClose={() => setParamsTarget(null)} />}

      {reportPresentation && <CadReportModal presentation={reportPresentation} products={capabilities.data?.products} onClose={() => setReportPresentation(null)} />}

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

      {modelsPopoverChat && (
        <CadModalList
          models={cadModalModels}
          isLoading={isModalCadVersionsLoading}
          isDownloadingId={isDownloadingCadFile ? downloadingCadItemId : null}
          onDownload={handleDownloadCadFile}
          onReport={(model) => { setReportPresentation(presentationFor(model.cad)); setModelsPopoverChatId(null); }}
          onClose={() => setModelsPopoverChatId(null)}
          popoverRef={modelsPopoverRef}
        />
      )}


    </div>
  );
}

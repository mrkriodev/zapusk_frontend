import { Plus } from "lucide-react";
import Layout from "../../../components/Layout";
import { useLocation, useNavigate } from "react-router-dom";
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
import ModelActions from "./components/chat/ModelActions";
import { useJobPercent } from "./components/cad/useJobPercent";
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
  // Переход из «Базы знаний»: открыть созданный чат и подставить вопрос
  const location = useLocation();
  const navigate = useNavigate();
  const [handoff] = useState(() => location.state as { chatId?: string; prefill?: string; openCreate?: boolean } | null);
  const [selectedChat, setActiveChat] = useState<string | null>(handoff?.chatId ?? null);
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

  const [input, setInput] = useState(handoff?.prefill ?? ""); // стейт для строки ввода
  useEffect(() => {
    if (handoff) navigate(location.pathname, { replace: true, state: null });
  }, [handoff, navigate, location.pathname]);
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

  // процент выполнения генерации: данные сервера или оценка по времени
  const jobPercent = useJobPercent(
    activeJob?.jobId ?? null,
    jobData && jobData.id === activeJob?.jobId ? jobData : undefined,
    Boolean(activeJob?.paused),
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

  const [isModalCreate, setIsModalCreate] = useState<boolean>(() => Boolean(handoff?.openCreate)); // стейт показа модалки создания чата 
  const [newChatName, setNewChatName] = useState(""); // стейт имя нового чата

  // коллбек создания чата
  const handleCreateChat = async () => {
    try {
      const newConversation = await createConversation({
        title: newChatName.trim() || "Новый объект",
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
  const inputPlaceholder = isGeneratingModel ? `Идет генерация модели${jobPercent && !activeJob?.paused ? ` · ${jobPercent.estimated && jobPercent.value > 0 ? "≈" : ""}${jobPercent.value}%` : ""}` : "Опишите нужную вам деталь";

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

  const activeChatTitle = chats.find((chat) => chat.id === activeChat)?.title;
  const centered = "px-[max(1rem,calc((100%_-_760px)/2))]";

  const chatsSection = (
    <ul className="space-y-0.5">
      {conversationsLoading && <li className="px-2.5 py-1.5 text-[13px] text-muted">Загрузка чатов...</li>}
      {conversationsError && <li className="px-2.5 py-1.5 text-[13px] text-danger">Ошибка загрузки чатов</li>}
      {chats.map((item) => (
        <ChatItem
          key={item.id}
          item={item}
          activeChat={activeChat}
          setActiveChat={handleSelectChat}
          onDeleteClick={() => setChatToDelete(item)}
          onModelsClick={() => setModelsPopoverChatId(item.id)}
        />
      ))}
    </ul>
  );

  return (
    <Layout
      title={activeChatTitle || "Лаборатория"}
      actions={activeChat && currentCad ? <ModelActions /> : undefined}
      onNewChat={() => setIsModalCreate(true)}
      chatsSection={chatsSection}
      mobileOpen={isSidebarOpen}
      onMobileOpenChange={setIsSidebarOpen}
    >
      {showEmptyChatsState ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-[44px] sm:leading-[1.15]">Дизайн аэрокосмических деталей</h1>
          <p className="mt-3 text-base text-muted sm:text-lg">Опишите деталь и получите готовый STL-файл</p>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-ink-2">У вас пока нет чатов, создайте новый и начните генерировать!</p>
          <button type="button" onClick={() => setIsModalCreate(true)} className="mt-5 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
            <Plus className="h-4 w-4" />
            Новый объект
          </button>
        </div>
      ) : (
        <>
          {(messages.length > 0 || currentCad) && selection.product && <div className={`shrink-0 pb-2 ${centered}`}><CatalogHints product={selection.product} engine={capabilities.data?.products.find((item) => item.id === 'engine_assembly')} /></div>}
          <ul ref={chatListRef} onScroll={(event) => {
            const list = event.currentTarget;
            followMessages.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
          }} className={`thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 pt-2 [&>*]:shrink-0 ${centered}`}>
            {messages.length === 0 && !currentCad && <>
              <li className="mb-8 mt-4 text-center sm:mt-10">
                <h1 className="text-[28px] font-medium leading-tight tracking-tight text-ink sm:text-[44px]">Дизайн аэрокосмических деталей</h1>
                <p className="mt-2 text-[15px] text-muted sm:text-lg">Опишите деталь и получите готовый STL-файл</p>
              </li>
              <CatalogWelcome
                products={capabilities.data?.products} product={selection.product}
                canChoose={selection.canChoose && !dialog.busy} loading={capabilities.isLoading || selection.loading}
                error={capabilities.isError} onChoose={selection.choose} onRetry={() => void capabilities.refetch()}
              />
            </>}
            {timeline.map((event) => event.type === 'cad' ? (
              <li key={event.key} className="mb-4 w-full"><CadResultCard presentation={presentationFor(event.cad)} products={capabilities.data?.products} /></li>
            ) : (
              <MessageItem key={event.key} message={event.message} knowledge={dialog.knowledge[event.message.id]} onDownloadCadFile={handleDownloadMessageCadFile} isDownloading={isDownloadingCadFile && downloadingCadItemId === event.message.id} />
            ))}
            {optimisticMessage?.conversation_id === activeChat && (
              <MessageItem message={optimisticMessage} />
            )}

            <FemReports fem={fem} conversationId={activeChat} />
            {isWaitingForMessage && <LoadingMessage />}
            {activeJob?.conversationId === activeChat && <CadJobCard job={jobData} percent={jobPercent} paused={Boolean(activeJob.paused)} error={jobFailure?.conversationId === activeChat ? jobFailure.message : undefined} reading={readingCad} onRetry={() => void retryCad()} />}
            {dialog.notice && <li role="status" className="mb-4 rounded-2xl bg-panel px-4 py-3 text-sm text-ink-2">{dialog.notice}</li>}
            {dialog.failures.filter(({ turn }) => turn.request.request_id !== dialog.prompt?.requestId).map(({ turn, message, retryable }) => (
              <li key={turn.request.request_id} role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{message}</p>
                {retryable && <button type="button" disabled={isInputBusy} onClick={() => dialog.retry(turn.request.request_id)} className="mt-2 rounded-full bg-white px-4 py-1.5 text-ink ring-1 ring-red-200 transition-colors hover:bg-red-100 disabled:opacity-40">Повторить</button>}
              </li>
            ))}

            {jobFailure?.conversationId === activeChat && !activeJob && (
              <ErrorMessage message={jobFailure.message} />
            )}
          </ul>

          <div className={`relative shrink-0 pb-4 lg:pb-6 ${centered}`}>
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
    </Layout>
  );
}

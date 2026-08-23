import { Menu, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import type { CadVersionModel, Chat } from "../../../types/UITypes/creatingTypes";
import type { Message } from "../../../types/apiTypes/MessageTypes";
import type { CadDownloadFormat, EngineParams, JsonObject } from "../../../types/apiTypes/CadTypes";
import ChatItem from "./components/chat/ChatItem";
import ErrorMessage from "./components/chat/ErrorMessage";
import LoadingMessage from "./components/chat/LoadingMessage";
import MessageItem from "./components/chat/MessageItem";
import DeleteModal from "./components/modals/DeleteModal";
import CreateModal from "./components/modals/CreateModal";
import {
  useChatWithAssistantMutation,
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useGenerateConversationMutation,
  useGetConservationByIdQuery,
  useGetConversationsQuery,
  useSendAdvancedMessageMutation,
} from "../../../api/repository/ConversationsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetJobByIdQuery } from "../../../api/repository/JobsApi";
import {
  useGetCadVersionsQuery,
  useLazyGetCadModelParamsQuery,
  useLazyDownloadCadFileQuery,
  useReviseCadMutation,
} from "../../../api/repository/CadApi";
import CadModalList from "./components/modals/CadModalList";
import ModelParamsModal from "./components/modals/ModelParamsModal";
import { JOB_POLL_TIMEOUT_MS } from "../../../constants/constants";
import { InputSendLine } from "./components/chat/InputSendLine";


export default function Creating() {
  // гет и мемо список чатов
  const { data: conversationsData, isLoading: conversationsLoading, error: conversationsError} = useGetConversationsQuery();
  const chats = useMemo(
    () => conversationsData?.items ?? [],
    [conversationsData?.items],
  );

  // стейт для селекта чата + тянем сообщения + все кады
  const [selectedChat, setActiveChat] = useState<string | null>(null);
  const activeChat = selectedChat ?? chats[0]?.id ?? null;
  const { currentData: conversationsIdData, refetch: refetchConversation } = useGetConservationByIdQuery(activeChat ?? skipToken);
  const messages = useMemo(() => conversationsIdData?.messages ?? [], [conversationsIdData?.messages]);
  const { data: cadVersionsData } = useGetCadVersionsQuery(activeChat ?? skipToken);
  const [assistantReadyConversationIds, setAssistantReadyConversationIds] = useState<Set<string>>(() => new Set());
  const hasAssistantResponse = Boolean(activeChat && (assistantReadyConversationIds.has(activeChat) || messages.some((message) => message.role === "assistant")));

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

  const [input, setInput] = useState(""); // стейт для строки ввода
  const [attachedModelParams, setAttachedModelParams] = useState<JsonObject | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [pendingRequestConversationId, setPendingRequestConversationId] =
    useState<string | null>(null);
  const [optimisticMessage, setOptimisticMessage] = useState<Message | null>(
    null,
  );
  const [assistantDraftParams, setAssistantDraftParams] = useState<EngineParams | null>(null);
  
  // пост отправка сообщения assist
  const [chatWithAssistant, { isLoading: isAssistantLoading }] = useChatWithAssistantMutation();
  
  const [generateConversation, { isLoading: isGeneratingRequest }] = useGenerateConversationMutation();
  const [sendAdvancedMessage, { isLoading: isSendingAdvancedMessage }] = useSendAdvancedMessageMutation();
  
  // гет и стейт загрузка cad файла
  const [downloadCadFileTrigger, { isFetching: isDownloadingCadFile }] = useLazyDownloadCadFileQuery();
  const [getCadModelParams, { isFetching: isLoadingModelParams }] = useLazyGetCadModelParamsQuery();
  const [reviseCad, { isLoading: isRevisingCad }] = useReviseCadMutation();
  const [downloadingCadItemId, setDownloadingCadItemId] = useState<string | null>(null);
  const [editingCadVersion, setEditingCadVersion] = useState<CadVersionModel | null>(null);
  const [modelParamsText, setModelParamsText] = useState("");
  const [modelParamsError, setModelParamsError] = useState<string | null>(null);
  
  // гет списка всех кадов
  const { data: modalCadVersionsData, isLoading: isModalCadVersionsLoading } = useGetCadVersionsQuery(modelsPopoverChatId ?? skipToken);

  // отправка сообщения генерации
  const handleSend = async () => {
    const text = input.trim();

    if (!text || !activeChat || !hasAssistantResponse) return;

    const conversationId = activeChat;
    setPendingRequestConversationId(conversationId);
    setInput("");
    setOptimisticMessage({
      id: `optimistic-${crypto.randomUUID()}`,
      conversation_id: conversationId,
      role: "user",
      content: text,
      cad_state_id: null,
      has_model_params: false,
      created_at: new Date().toISOString(),
    });

    try {
      setJobFailure((current) =>
        current?.conversationId === conversationId ? null : current,
      );

      const job = await generateConversation({
        conversationId,
        text,
        ...(assistantDraftParams ? { params: assistantDraftParams } : {}),
      }).unwrap();

      setActiveJob({
        jobId: job.job_id,
        conversationId,
      });
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      setOptimisticMessage(null);
    } finally {
      setPendingRequestConversationId(null);
    }
  };

  // отправка соообщения ассиста
  const handleAssistantSubmit = async () => {
    const text = input.trim();

    if (!text || !activeChat) return;

    const conversationId = activeChat;
    setPendingRequestConversationId(conversationId);
    setInput("");
    setOptimisticMessage({
      id: `optimistic-${crypto.randomUUID()}`,
      conversation_id: conversationId,
      role: "user",
      content: text,
      cad_state_id: null,
      has_model_params: false,
      created_at: new Date().toISOString(),
    });

    try {
      const response = await chatWithAssistant({
        conversationId,
        text,
      }).unwrap();
      setAssistantDraftParams(response.draft_params);
      setAssistantReadyConversationIds((current) => {
        const next = new Set(current);
        next.add(conversationId);
        return next;
      });
    } catch (error) {
      console.error("Ошибка уточнения параметров:", error);
      setOptimisticMessage(null);
    } finally {
      setPendingRequestConversationId(null);
    }
  };

  // стейты для поллинга
  const [activeJob, setActiveJob] = useState<{jobId: string; conversationId: string;} | null>(null);
  const [jobFailure, setJobFailure] = useState<{conversationId: string; message: string;} | null>(null);
  const canPollJob = Boolean(activeJob);

  // хук поллинга сообщения
  const { data: jobData, error: jobError } = useGetJobByIdQuery(
    activeJob?.jobId ?? skipToken,
    {
      pollingInterval: canPollJob ? 2000 : 0,
      skipPollingIfUnfocused: true,
    },
  );

  // юзеффект таймер поллинга
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

  // юзеффект ошибки поллинга
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

  // юзеффект отслеживания статуса поллинга
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
    setActiveChat(chatId);
    setIsSidebarOpen(false);
    setModelsPopoverChatId(null);
  };

  useEffect(() => {
    const resetId = window.setTimeout(() => setAssistantDraftParams(null), 0);
    return () => window.clearTimeout(resetId);
  }, [activeChat]);

  useEffect(() => {
    if (!optimisticMessage) return;

    const optimisticCreatedAt = new Date(optimisticMessage.created_at).getTime();
    const hasServerMessage = messages.some(
      (message) =>
        message.conversation_id === optimisticMessage.conversation_id &&
        message.role === "user" &&
        message.content === optimisticMessage.content &&
        new Date(message.created_at).getTime() >= optimisticCreatedAt - 5_000,
    );

    if (hasServerMessage) {
      const clearId = window.setTimeout(() => setOptimisticMessage(null), 0);
      return () => window.clearTimeout(clearId);
    }
  }, [messages, optimisticMessage]);

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
      (pendingRequestConversationId === activeChat ||
        (activeJob && activeJob.conversationId === activeChat)),
  );
  const isGeneratingModel = Boolean(activeJob);
  const isInputBusy = isAssistantLoading || isGeneratingRequest || isSendingAdvancedMessage || isRevisingCad || isGeneratingModel;

  const showEmptyChatsState = !conversationsLoading && !conversationsError && !hasChats; // флаг отсутствия чатов
  const inputPlaceholder = isGeneratingModel ? "Идет генерация модели" : "Опишите нужную вам деталь";

  const startJob = (jobId: string, conversationId: string) => {
    setJobFailure((current) => current?.conversationId === conversationId ? null : current);
    setActiveJob({ jobId, conversationId });
  };

  const parseModelParams = (value: string): JsonObject | null => {
    try {
      const parsed: unknown = JSON.parse(value);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        throw new Error("JSON должен содержать объект параметров.");
      }
      return parsed as JsonObject;
    } catch (error) {
      setAttachmentError(error instanceof Error && error.message !== "Unexpected end of JSON input" ? error.message : "Не удалось прочитать JSON-чертёж.");
      return null;
    }
  };

  const handleAttachModelParams = async (file: File) => {
    try {
      const parsed = parseModelParams(await file.text());
      if (!parsed) {
        setAttachedModelParams(null);
        setAttachedFileName(null);
        return;
      }
      setAttachedModelParams(parsed);
      setAttachedFileName(file.name);
      setAttachmentError(null);
    } catch {
      setAttachedModelParams(null);
      setAttachedFileName(null);
      setAttachmentError("Не удалось прочитать выбранный файл.");
    }
  };

  const clearAttachment = () => {
    setAttachedModelParams(null);
    setAttachedFileName(null);
    setAttachmentError(null);
  };

  const handleAdvancedSubmit = async () => {
    if (!activeChat || !attachedModelParams) return;
    const conversationId = activeChat;
    const text = input.trim() || "Результаты FEM-расчёта";
    setPendingRequestConversationId(conversationId);
    setOptimisticMessage({ id: `optimistic-${crypto.randomUUID()}`, conversation_id: conversationId, role: "user", content: text, cad_state_id: null, has_model_params: true, created_at: new Date().toISOString() });
    try {
      const job = await sendAdvancedMessage({ conversationId, text, modelParams: attachedModelParams }).unwrap();
      setInput("");
      clearAttachment();
      startJob(job.job_id, conversationId);
    } catch (error) {
      console.error("Ошибка отправки FEM-чертежа:", error);
      setOptimisticMessage(null);
    } finally {
      setPendingRequestConversationId(null);
    }
  };

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

  const handleDownloadCurrentModelParams = async () => {
    const currentCad = conversationsIdData?.current_cad;
    if (!activeChat || !currentCad?.files.model_params) return;
    try {
      setDownloadingCadItemId(`current-${currentCad.id}-params`);
      const modelParams = await getCadModelParams({ conversationId: activeChat, version: currentCad.version }).unwrap();
      saveBlob(new Blob([JSON.stringify(modelParams, null, 2)], { type: "application/json" }), `model_v${currentCad.version}_params.json`);
    } catch (error) {
      console.error("Ошибка скачивания JSON-чертежа:", error);
    } finally {
      setDownloadingCadItemId(null);
    }
  };

  const handleEditModelParams = async (model: CadVersionModel) => {
    setEditingCadVersion(model);
    setModelParamsText("");
    setModelParamsError(null);
    try {
      const modelParams = await getCadModelParams({ conversationId: model.conversationId, version: model.version }).unwrap();
      setModelParamsText(JSON.stringify(modelParams, null, 2));
    } catch (error) {
      console.error("Ошибка загрузки JSON-чертежа:", error);
      setModelParamsError("Не удалось загрузить параметры модели.");
    }
  };

  const handleReviseCad = async () => {
    if (!editingCadVersion) return;
    const modelParams = parseModelParams(modelParamsText);
    if (!modelParams) {
      setModelParamsError("JSON содержит ошибку. Исправьте его перед отправкой.");
      return;
    }
    try {
      const job = await reviseCad({ conversationId: editingCadVersion.conversationId, version: editingCadVersion.version, modelParams }).unwrap();
      startJob(job.job_id, editingCadVersion.conversationId);
      setEditingCadVersion(null);
      setModelParamsError(null);
    } catch (error) {
      console.error("Ошибка перегенерации CAD:", error);
      setModelParamsError("Не удалось запустить перегенерацию модели.");
    }
  };

  // Реальные CAD-версии диалога, возвращаемые backend.
  const cadModalModels = useMemo(() => {
    const items = modalCadVersionsData?.items ?? [];
    return items.map((item): CadVersionModel => ({ id: item.id, conversationId: item.conversation_id, version: item.version, createdAt: item.created_at, hasStl: Boolean(item.files.stl), hasStep: Boolean(item.files.step), hasModelParams: Boolean(item.files.model_params) }));
  }, [modalCadVersionsData?.items]);

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
                  <ul className="flex flex-col-reverse flex-1 min-h-0 pt-4 px-4 pb-2 overflow-y-auto">
                    {isWaitingForMessage && <LoadingMessage />}

                    {optimisticMessage?.conversation_id === activeChat && (
                      <MessageItem message={optimisticMessage} />
                    )}

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

                  <InputSendLine
                    value={input}
                    placeholder={inputPlaceholder}
                    onChange={setInput}
                    onSend={handleSend}
                    onAssistantSubmit={handleAssistantSubmit}
                    isAssistantDisabled={
                      isInputBusy || !activeChat || !input.trim()
                    }
                    isInputDisabled={isInputBusy || !activeChat}
                    isSendDisabled={
                      isInputBusy ||
                      !activeChat ||
                      !hasAssistantResponse
                    }
                    needsAssistantPrompt={!hasAssistantResponse}
                    attachedFileName={attachedFileName}
                    attachmentError={attachmentError}
                    canDownloadModelParams={Boolean(conversationsIdData?.current_cad?.files.model_params)}
                    canReviseFromAttachment={Boolean(attachedModelParams && activeChat)}
                    onAttachFile={handleAttachModelParams}
                    onClearAttachment={clearAttachment}
                    onDownloadModelParams={handleDownloadCurrentModelParams}
                    onAdvancedSubmit={handleAdvancedSubmit}
                  />
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

      {modelsPopoverChat && (
        <CadModalList
          models={cadModalModels}
          isLoading={isModalCadVersionsLoading}
          isDownloadingId={isDownloadingCadFile ? downloadingCadItemId : null}
          onDownload={handleDownloadCadFile}
          onEditModelParams={handleEditModelParams}
          onClose={() => setModelsPopoverChatId(null)}
          popoverRef={modelsPopoverRef}
        />
      )}

      {editingCadVersion && (
        <ModelParamsModal
          version={editingCadVersion.version}
          value={modelParamsText}
          error={modelParamsError}
          isLoading={isLoadingModelParams}
          isSubmitting={isRevisingCad}
          onChange={(value) => {
            setModelParamsText(value);
            setModelParamsError(null);
          }}
          onCancel={() => {
            if (!isRevisingCad) setEditingCadVersion(null);
          }}
          onSubmit={handleReviseCad}
        />
      )}
    </div>
  );
}

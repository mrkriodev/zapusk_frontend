import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, UserRound } from "lucide-react";
import Layout from "../../components/Layout";
import ModelItem from "./components/ModelItem";
import DeleteObjectModal from "./components/DeleteObjectModal";
import { useDeleteConversationMutation, useGetConversationsQuery } from "../../api/repository/ConversationsApi";
import { useLazyDownloadCadFileQuery } from "../../api/repository/CadApi";
import type { Conversation } from "../../types/apiTypes/ConversationTypes";

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

export default function Profile() {
  const navigate = useNavigate();
  // Объекты пользователя — это его диалоги в Лаборатории (GET /conversations)
  const { data, isLoading, isError, refetch } = useGetConversationsQuery({ limit: 100, offset: 0 });
  const objects = data?.items ?? [];
  const total = data?.total ?? objects.length;

  const [deleteConversation, { isLoading: isDeleting }] = useDeleteConversationMutation();
  const [toDelete, setToDelete] = useState<Conversation | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [downloadCadFile] = useLazyDownloadCadFileQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const titleOf = (item: Conversation) => item.title?.trim() || "Без названия";

  const handleOpen = (item: Conversation) => navigate("/", { state: { chatId: item.id } });

  const handleDownload = async (item: Conversation) => {
    if (item.current_version == null) return;
    try {
      setDownloadingId(item.id);
      const file = await downloadCadFile({ conversationId: item.id, version: item.current_version, format: "stl" }).unwrap();
      saveBlob(file.blob, file.fileName ?? `${titleOf(item)}_v${item.current_version}.stl`);
    } catch (error) {
      console.error("Ошибка скачивания STL:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleteError(null);
      await deleteConversation(toDelete.id).unwrap();
      setToDelete(null);
    } catch (error) {
      console.error("Ошибка удаления объекта:", error);
      setDeleteError("Не удалось удалить объект. Попробуйте ещё раз.");
    }
  };

  return (
    <Layout title="Профиль">
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-8 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <section className="flex items-center gap-4 rounded-2xl bg-panel p-4 ring-1 ring-line/70 sm:gap-5 sm:p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white sm:h-16 sm:w-16">
              <UserRound className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-medium tracking-tight text-ink sm:text-2xl">Username</h1>
              <p className="truncate text-sm text-muted">email@gmail.com</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-medium tracking-tight text-ink sm:text-[32px]">{isLoading ? "…" : total}</div>
              <div className="text-xs text-muted sm:text-sm">Созданных объектов</div>
            </div>
          </section>

          <h2 className="mb-4 mt-8 text-lg font-medium tracking-tight text-ink sm:text-xl">
            Ваши объекты
          </h2>

          {isLoading && <p className="text-sm text-muted">Загрузка объектов…</p>}

          {isError && (
            <div role="alert" className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-danger">
              Не удалось загрузить объекты.
              <button type="button" onClick={() => refetch()} className="rounded-full bg-white px-3 py-1 font-medium text-ink ring-1 ring-line">Повторить</button>
            </div>
          )}

          {!isLoading && !isError && objects.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl bg-panel p-8 text-center ring-1 ring-line/70">
              <p className="text-sm text-ink-2">У вас пока нет объектов.</p>
              <button
                type="button"
                onClick={() => navigate("/", { state: { openCreate: true } })}
                className="mt-4 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                <Plus className="h-4 w-4" />
                Новый объект
              </button>
            </div>
          )}

          {objects.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {objects.map((item) => (
                <ModelItem
                  key={item.id}
                  model={item}
                  isDownloading={downloadingId === item.id}
                  onOpen={handleOpen}
                  onDownload={handleDownload}
                  onDelete={(target) => { setDeleteError(null); setToDelete(target); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {toDelete && (
        <DeleteObjectModal
          title={titleOf(toDelete)}
          isDeleting={isDeleting}
          error={deleteError}
          onCancel={() => setToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Layout>
  );
}

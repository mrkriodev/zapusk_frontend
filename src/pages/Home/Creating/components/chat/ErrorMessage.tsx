type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <li className="flex justify-start">
      <div className="mb-3 max-w-[85%] rounded-2xl border border-red-400/40 bg-red-950/70 px-4 py-3 text-red-100 backdrop-blur-sm lg:max-w-2xl lg:px-6 lg:py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
          Ошибка генерации
        </p>
        <p className="text-sm leading-relaxed lg:text-md">{message}</p>
      </div>
    </li>
  );
}

import { Send, SlidersHorizontal } from "lucide-react";

type InputSendLineProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAssistantSubmit: () => void;
  isAssistantDisabled: boolean;
  isInputDisabled: boolean;
  isSendDisabled: boolean;
};

export function InputSendLine({
  value,
  placeholder,
  onChange,
  onSend,
  onAssistantSubmit,
  isAssistantDisabled,
  isInputDisabled,
  isSendDisabled,
}: InputSendLineProps) {
    return(
        <div className="w-full shrink-0 flex bg-blue-900/30 border-t p-3 border-blue-400/20 gap-3">
                            <button
                              type="button"
                              onClick={onAssistantSubmit}
                              disabled={isAssistantDisabled}
                              className="shrink-0 lg:rounded-full rounded-2xl border border-purple-400/40 bg-purple-500/10 px-3 py-3 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/20 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-60 md:px-4 md:py-4 flex items-center gap-1.5"
                              title="Уточнить параметры"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                              <span className="hidden sm:inline">Уточнить</span>
                            </button>
        
                            <input
                              type="text"
                              value={value}
                              placeholder={placeholder}
                              onChange={(e) => onChange(e.target.value)}
                            //   onKeyDown={(e) => e.key === "Enter" && onSend()}
                              disabled={isInputDisabled}
                              className="lg:flex-8/10 flex-7/10 bg-blue-800/30 border border-blue-400/30 lg:rounded-3xl rounded-2xl lg:px-6 lg:py-4 px-4 py-2 text-white placeholder-blue-300/50 focus:outline-none 
                                                focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 text-base"
                            />
        
                            <button
                              type="button"
                              onClick={onSend}
                              disabled={isSendDisabled}
                              className="flex lg:flex-1/10 flex-2/10 lg:max-w-50 max-w-25 items-center  justify-center py-2 lg:rounded-3xl rounded-2xl transition-all 
                                                                    bg-linear-to-r text-sm from-blue-600 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
    )
}

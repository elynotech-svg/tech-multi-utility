import { TextareaHTMLAttributes } from "react";

type TextareaWithLabelProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function TextareaWithLabel({
  label,
  hint,
  id,
  className = "",
  ...props
}: TextareaWithLabelProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <textarea
        id={textareaId}
        className={`min-h-[140px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
        {...props}
      />
    </div>
  );
}

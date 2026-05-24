"use client";

import { playChime, playBell } from "@/lib/sounds";

interface Props {
  sound: "chime" | "bell";
}

export default function SoundPreviewButton({ sound }: Props) {
  const handleClick = () => {
    if (sound === "chime") playChime();
    else playBell();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Preview ${sound} sound`}
      className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-all shrink-0"
      aria-label={`Preview ${sound} sound`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    </button>
  );
}

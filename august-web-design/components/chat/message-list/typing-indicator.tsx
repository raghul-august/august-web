'use client';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <span className="h-[7px] w-[7px] bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-[7px] w-[7px] bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-[7px] w-[7px] bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

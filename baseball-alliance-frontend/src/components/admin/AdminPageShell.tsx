import React from "react";

/** Clears the fixed h-20 (80px) navbar plus a small gap. */
export const ADMIN_PAGE_SHELL_CLASS =
  "min-h-screen bg-slate-50 text-slate-900 pt-24 pb-10 px-4";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function AdminPageShell({ children, className = "" }: Props) {
  return (
    <main className={`${ADMIN_PAGE_SHELL_CLASS} ${className}`.trim()}>
      {children}
    </main>
  );
}

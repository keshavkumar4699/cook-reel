import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  tone: 'neutral' | 'success' | 'error';
  action?: { label: string; onPress: () => void };
}

interface ToastState {
  current: Toast | null;
  show(message: string, options?: { tone?: Toast['tone']; action?: Toast['action']; durationMs?: number }): void;
  hide(): void;
}

let timer: ReturnType<typeof setTimeout> | null = null;
let counter = 0;

export const useToast = create<ToastState>()((set) => ({
  current: null,
  show(message, options = {}) {
    if (timer) clearTimeout(timer);
    const toast: Toast = { id: ++counter, message, tone: options.tone ?? 'neutral', action: options.action };
    set({ current: toast });
    timer = setTimeout(() => set((s) => (s.current?.id === toast.id ? { current: null } : s)), options.durationMs ?? 2800);
  },
  hide() {
    if (timer) clearTimeout(timer);
    set({ current: null });
  },
}));

export const toast = (message: string, options?: Parameters<ToastState['show']>[1]) => useToast.getState().show(message, options);

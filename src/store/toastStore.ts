import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  /** Milliseconds before dismissal. Use 0 to keep the message until closed. */
  duration?: number;
}

export interface ToastMessage extends ToastOptions {
  id: number;
  variant: ToastVariant;
  duration: number;
}

interface ToastState {
  messages: ToastMessage[];
  show: (variant: ToastVariant, options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  messages: [],
  show: (variant, options) => {
    const id = ++nextId;
    const message: ToastMessage = {
      ...options, id, variant, duration: options.duration ?? (variant === 'error' ? 0 : 7000),
    };
    set((state) => ({ messages: [...state.messages, message].slice(-3) }));
    return id;
  },
  dismiss: (id) => set((state) => ({ messages: state.messages.filter((message) => message.id !== id) })),
}));

// One shared API for visitor-facing feedback throughout the portfolio.
export const toast = {
  success: (options: ToastOptions) => useToastStore.getState().show('success', options),
  error: (options: ToastOptions) => useToastStore.getState().show('error', options),
  info: (options: ToastOptions) => useToastStore.getState().show('info', options),
  dismiss: (id: number) => useToastStore.getState().dismiss(id),
};

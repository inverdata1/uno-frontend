import { create } from 'zustand';

// Toast store for global error/success messages
export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString();
    const toast = {
      id,
      type, // 'success', 'error', 'warning', 'info'
      title,
      message,
      duration,
      createdAt: Date.now()
    };

    set(state => ({
      toasts: [...state.toasts, toast]
    }));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  }
}));

// Convenient methods
export const toast = {
  success: (message, title = 'Éxito') =>
    useToastStore.getState().addToast({ type: 'success', title, message }),

  error: (message, title = 'Error') =>
    useToastStore.getState().addToast({ type: 'error', title, message }),

  warning: (message, title = 'Advertencia') =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),

  info: (message, title = 'Información') =>
    useToastStore.getState().addToast({ type: 'info', title, message })
};
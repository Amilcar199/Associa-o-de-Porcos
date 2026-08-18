'use client'

import toast from 'react-hot-toast'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export function useToast() {
  const showSuccess = (message: string) => toast.success(message)
  const showError = (message: string) => toast.error(message)
  const showInfo = (message: string) => toast(message)
  const showWarning = (message: string) => toast(message, { icon: '⚠️' })

  return {
    toasts: [] as Array<{ id: string; type: ToastType; message: string }>,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast: (_id: string) => undefined,
  }
}

export function ToastContainer() {
  return null
}

export default function Toast() {
  return null
}

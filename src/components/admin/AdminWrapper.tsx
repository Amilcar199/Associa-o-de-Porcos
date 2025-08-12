'use client'

import { ToastContainer } from '@/components/Toast'

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}
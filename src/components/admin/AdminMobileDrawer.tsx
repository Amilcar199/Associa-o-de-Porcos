'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AdminNav from './AdminNav'

interface AdminMobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// O cabeçalho usa backdrop-blur, o que o torna o bloco de contenção de qualquer
// descendente `fixed`. Por isso a gaveta vive num portal no body.
export default function AdminMobileDrawer({ isOpen, onClose }: AdminMobileDrawerProps) {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setHost(document.querySelector<HTMLElement>('.admin-shell') || document.body)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  if (!host) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="lg:hidden fixed top-16 bottom-0 left-0 w-72 max-w-[85vw] bg-white border-r border-gray-200 z-50 overflow-y-auto"
          >
            <AdminNav onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    host
  )
}

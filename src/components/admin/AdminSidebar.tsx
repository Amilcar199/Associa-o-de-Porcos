'use client'

import AdminNav from './AdminNav'

const AdminSidebar = () => {
  return (
    <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <AdminNav />
    </aside>
  )
}

export default AdminSidebar

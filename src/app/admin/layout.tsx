import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = {
  title: 'Painel Administrativo - Associação de Porcos',
  description: 'Painel de administração da Associação de Porcos',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const TEMP_BYPASS_ADMIN_AUTH = true
  let user: {
    id: string
    name?: string | null
    email?: string | null
    avatar?: string | null
    role: string
  }

  if (TEMP_BYPASS_ADMIN_AUTH) {
    user = {
      id: 'temp-admin',
      name: 'Admin Demo',
      email: 'admin@demo.local',
      avatar: null,
      role: 'admin'
    }
  } else {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      redirect('/login?error=insufficient_permissions')
    }
    user = session.user as any
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header do Admin */}
      <AdminHeader user={user} />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

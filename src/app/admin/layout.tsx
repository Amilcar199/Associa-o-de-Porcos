import { redirect } from 'next/navigation'
import { BRAND_NAME } from '@/lib/brand'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminWrapper from '@/components/admin/AdminWrapper'

export const metadata = {
  title: `Painel Administrativo - ${BRAND_NAME}`,
  description: `Painel de administração da ${BRAND_NAME}`,
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    redirect('/login?error=insufficient_permissions')
  }
  const user = session.user

  return (
    <AdminWrapper>
      <div className="min-h-screen bg-gray-100 overflow-x-hidden pt-16">
        {/* Header do Admin */}
        <AdminHeader user={user} />
        
        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar />
          
          {/* Conteúdo Principal */}
          <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminWrapper>
  )
}

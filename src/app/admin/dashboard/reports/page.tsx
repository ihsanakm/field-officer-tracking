import { getOfficers } from '@/app/actions/admin'
import { getUserProfile } from '@/app/actions/auth'
import { Navbar } from '@/components/navbar'
import { ReportsClient } from './reports-client'

export default async function AdminReportsPage() {
  const [{ officers, error }, profile] = await Promise.all([
    getOfficers(),
    getUserProfile()
  ])

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20">
      <Navbar role="admin" fullName={profile?.full_name} />

      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Intelligence Archive</h2>
            <p className="text-gray-500 font-medium italic text-sm">Generate human-readable Excel audits for the entire force</p>
          </div>
        </header>

        {error ? (
          <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-8 rounded-[2.5rem] shadow-xl shadow-rose-500/5 text-center">
             <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mx-auto mb-4">
                <span className="text-white font-black text-2xl">!</span>
             </div>
             <h3 className="text-lg font-black uppercase mb-1">Archive Connection Failure</h3>
             <p className="text-sm font-bold opacity-80">{error}</p>
          </div>
        ) : (
          <ReportsClient officers={officers as any} />
        )}
      </div>
    </div>
  )
}

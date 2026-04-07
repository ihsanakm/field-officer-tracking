import { getOfficers } from '@/app/actions/admin'
import { getUserProfile } from '@/app/actions/auth'
import { Navbar } from '@/components/navbar'
import { PersonnelClient } from './personnel-client'

export default async function PersonnelPage() {
  const [{ officers, error }, profile] = await Promise.all([
    getOfficers(100),
    getUserProfile()
  ])

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20">
      <Navbar role="admin" fullName={profile?.full_name} />

      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-rose-500/5">
             <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                <span className="text-white font-black text-lg">!</span>
             </div>
             <p className="text-sm font-bold">Directory Load Error: {error}</p>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Personnel Directory</h2>
            <p className="text-gray-500 font-medium italic text-sm">Force roster management and deployment auditing</p>
          </div>
        </header>

        <PersonnelClient officers={officers as any} />
      </div>
    </div>
  )
}

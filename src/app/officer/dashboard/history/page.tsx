import { getPersonalHistory } from '@/app/actions/attendance'
import { getUserProfile } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { PersonalHistory } from '../personal-history'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

export default async function OfficerHistoryPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams.page || '1')
  const [{ history, totalPages = 0, count = 0 }, profile] = await Promise.all([
    getPersonalHistory(currentPage),
    getUserProfile()
  ])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 pb-20">
      <Navbar role="officer" fullName={profile?.full_name} />

      <main className="flex-1 flex flex-col items-center py-12 px-4 space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-1">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Your Activity Log</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest bg-gray-100/50 inline-block px-3 py-1 rounded-full">Archive: {count} total entries</p>
        </div>
        
        <div className="w-full max-w-2xl space-y-8 flex flex-col items-center">
          <PersonalHistory history={history as any} />
          
          {totalPages > 1 && (
            <div className="flex items-center gap-4 py-8">
              <Link href={`/officer/dashboard/history?page=${currentPage - 1}`} className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}>
                <Button variant="outline" size="sm" disabled={currentPage <= 1} className="rounded-xl border-gray-100 font-bold">Previous</Button>
              </Link>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
              <Link href={`/officer/dashboard/history?page=${currentPage + 1}`} className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} className="rounded-xl border-gray-100 font-bold">Next</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

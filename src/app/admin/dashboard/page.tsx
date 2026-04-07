import { getDashboardStats, getOfficers, getRecentActivities } from '@/app/actions/admin'
import { getUserProfile } from '@/app/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Navbar } from '@/components/navbar'
import { formatTime } from '@/lib/timezone'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [stats, { officers, error: officersError }, { activities, error: activityError }, profile] = await Promise.all([
    getDashboardStats(),
    getOfficers(5),
    getRecentActivities(5),
    getUserProfile()
  ])
  const errorMsg = (stats as any).error || officersError || activityError

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20">
      <Navbar role="admin" fullName={profile?.full_name} />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        {errorMsg && (
          <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-rose-500/5">
             <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                <span className="text-white font-black text-lg">!</span>
             </div>
             <p className="text-sm font-bold">Data Connectivity Alert: {errorMsg}</p>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">Aid Deployment</h2>
            <p className="text-slate-500 font-medium italic text-sm md:text-base">Real-time personnel deployment analytics</p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-2 p-4 md:p-6">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total Workers</p>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tighter leading-none">{(stats as any)?.totalOfficers || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-2 p-4 md:p-6">
              <p className="text-[11px] uppercase tracking-wider font-bold text-green-500">In Field</p>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-3xl md:text-4xl font-black text-green-600 leading-none">{(stats as any)?.checkedIn || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-2 p-4 md:p-6">
              <p className="text-[11px] uppercase tracking-wider font-bold text-blue-500">Mission End</p>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-3xl md:text-4xl font-black text-blue-600 leading-none">{(stats as any)?.checkedOut || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-2 p-4 md:p-6">
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-rose-500">Absent Today</p>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-3xl md:text-4xl font-black text-rose-600 leading-none">{(stats as any)?.absentToday || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT INTELLIGENCE SECTION (Top 5 Activities) */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/30 border-none overflow-hidden">
          <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
            <h2 className="font-bold text-lg md:text-xl text-slate-800 tracking-tight">Recent Field Activity</h2>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-500 px-3 py-1 rounded-full whitespace-nowrap">Live Activity Stream</span>
          </div>
          <div className="divide-y divide-gray-50">
            {activities?.length === 0 ? (
               <div className="p-12 text-center text-gray-400 italic">Static state - No recent activity packets.</div>
            ) : (
              activities?.map(activity => (
                <div key={activity.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/50 transition-all group">
                   <div className="flex items-center gap-4 min-w-[140px]">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                        activity.type === 'check_in' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {activity.type === 'check_in' ? 'Check In' : 'Check Out'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{formatTime(activity.logged_at, { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   <div className="flex-1">
                      <div className="font-black text-xs text-gray-900 leading-none mb-1">{(activity.users as any)?.full_name || 'Anonymous User'}</div>
                      <div className="space-y-1">
                         <p className="text-[11px] text-gray-500 font-medium italic line-clamp-1 italic">
                            Task: &quot;{activity.task_description || (activity.type === 'check_out' ? 'Assigned Mission Complete' : 'Mission Active')}&quot;
                         </p>
                         {activity.type === 'check_out' && activity.closing_remarks && (
                            <p className="text-[11px] text-blue-600 font-bold bg-blue-50/50 px-2 py-0.5 rounded-lg border border-blue-50/50 inline-block italic">
                               Remarks: &quot;{activity.closing_remarks}&quot;
                            </p>
                         )}
                      </div>
                   </div>
                   <div className="hidden md:block text-right">
                      <Link href={`/admin/dashboard/employee/${activity.user_id}`}>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl">Review Personnel Log</Button>
                      </Link>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ACTIVE ROSTER SNAPSHOT (Last 5 Active Users) */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/30 border-none overflow-hidden pb-4">
          <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-black text-lg md:text-xl text-gray-900 tracking-tight">Recent Deployment Activity</h2>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-400 px-3 py-1 rounded-full whitespace-nowrap">Last 5 Seen</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[600px] md:min-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="px-8 text-[11px] font-bold uppercase text-slate-400 tracking-wider">FullName</TableHead>
                    <TableHead className="px-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Work Identity</TableHead>
                    <TableHead className="text-right px-8 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-gray-400 italic">
                        No recent deployment activity detected.
                      </TableCell>
                    </TableRow>
                  ) : (
                    officers?.map((officer) => (
                      <TableRow key={officer.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell className="px-8 py-5">
                           <div className="font-bold text-gray-900 text-sm">{officer.full_name || 'Unnamed Personnel'}</div>
                        </TableCell>
                        <TableCell className="px-4 text-gray-400 font-bold text-[10px]">{officer.email}</TableCell>
                        <TableCell className="text-right px-8">
                          <Link href={`/admin/dashboard/employee/${officer.id}`}>
                            <Button variant="secondary" className="rounded-xl font-bold bg-slate-100/80 text-[11px] uppercase tracking-wider text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all px-4 h-9">
                              Access Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

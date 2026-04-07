import { getOfficerHistory } from '@/app/actions/admin'
import { getUserProfile } from '@/app/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Navbar } from '@/components/navbar'
import { getHumanAddress } from '@/lib/geo'
import { formatTime, formatDate } from '@/lib/timezone'

type LogEntry = {
  id: string;
  type: 'check_in' | 'check_out';
  logged_at: string;
  task_description: string | null;
  closing_remarks: string | null;
  latitude: number;
  longitude: number;
};

type Session = {
  id: string;
  checkIn: LogEntry;
  checkOut?: LogEntry;
  durationMins?: number;
  checkInAddress?: string;
  checkOutAddress?: string;
};

export default async function EmployeeHistory({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const [{ history, error }, profile] = await Promise.all([
    getOfficerHistory(resolvedParams.id),
    getUserProfile()
  ])

  const rawLogs = (history || []) as LogEntry[];
  const sorted = [...rawLogs].sort((a,b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
  const sessions: Session[] = [];
  let currentSession: Partial<Session> | null = null;

  sorted.forEach(log => {
      if (log.type === 'check_in') {
          if (currentSession) sessions.unshift(currentSession as Session);
          currentSession = { id: log.id, checkIn: log };
      } else if (log.type === 'check_out' && currentSession) {
          currentSession.checkOut = log;
          currentSession.durationMins = (new Date(log.logged_at).getTime() - new Date(currentSession.checkIn!.logged_at).getTime()) / 60000;
          sessions.unshift(currentSession as Session);
          currentSession = null;
      }
  });
  if (currentSession) sessions.unshift(currentSession as Session);

  const enhancedSessions = await Promise.all(sessions.map(async (s) => ({
      ...s,
      checkInAddress: await getHumanAddress(s.checkIn.latitude, s.checkIn.longitude),
      checkOutAddress: s.checkOut ? await getHumanAddress(s.checkOut.latitude, s.checkOut.longitude) : undefined
  })));

  const totalWorkedMins = sessions.reduce((sum, s) => sum + (s.durationMins || 0), 0);
  const totalWorkedHours = (totalWorkedMins / 60).toFixed(1);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20">
      <Navbar role="admin" fullName={profile?.full_name} />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-rose-500/5">
             <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                <span className="text-white font-black text-lg">!</span>
             </div>
             <p className="text-sm font-bold">Audit Alert: {error}</p>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-none">Mission History</h2>
            <p className="text-slate-500 font-medium italic text-base">Humanitarian field tracking history</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-50 self-start md:self-auto">
             <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-xl">S</span>
             </div>
             <div>
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider leading-none mb-1">Total Effort (30d)</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900">{totalWorkedHours} <span className="text-sm text-gray-400">Hours</span></p>
             </div>
          </div>
        </header>

        {/* DESKTOP VIEW: TABLE DISPLAY */}
        <Card className="hidden md:block border-none shadow-2xl shadow-gray-200/40 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 bg-gray-50/30 px-10 py-6">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">Historical Deployment Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="px-10 py-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Date</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Deployment (In)</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Completion (Out)</TableHead>
                    <TableHead className="px-10 text-right text-[11px] font-bold uppercase text-slate-400 tracking-wider">Span</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enhancedSessions.map((session) => (
                    <TableRow key={session.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-10 py-8">
                         <div className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatDate(session.checkIn.logged_at, { month: 'short', day: 'numeric', weekday: 'short' })}</div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">{formatTime(session.checkIn.logged_at, { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-xs font-black text-gray-800 tracking-tight">{session.checkInAddress}</span>
                           </div>
                           <p className="text-[11px] text-gray-500 italic leading-relaxed border-l-2 border-gray-100 pl-3">&quot;{session.checkIn.task_description}&quot;</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {session.checkOut ? (
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{formatTime(session.checkOut.logged_at, { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-xs font-black text-gray-800 tracking-tight">{session.checkOutAddress}</span>
                             </div>
                             <p className="text-[11px] text-blue-600 font-bold bg-blue-50/40 px-3 py-1.5 rounded-xl border border-blue-50/50 italic">&quot;{session.checkOut.closing_remarks}&quot;</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active Duty</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-10">
                         {session.durationMins && <span className="text-sm font-black text-gray-900">{Math.floor(session.durationMins / 60)}h {Math.round(session.durationMins % 60)}m</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>

        {/* MOBILE VIEW: CARD DISPLAY */}
        <div className="md:hidden space-y-4">
           {enhancedSessions.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center text-gray-400 italic font-medium">No sessions detected.</div>
           ) : (
             enhancedSessions.map(session => (
               <div key={session.id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 border border-gray-50 space-y-6">
                  <header className="flex items-center justify-between">
                     <div className="text-sm font-black text-gray-900 uppercase tracking-widest">{formatDate(session.checkIn.logged_at, { month: 'short', day: 'numeric', weekday: 'short' })}</div>
                     {session.durationMins && <div className="bg-gray-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{Math.floor(session.durationMins / 60)}h {Math.round(session.durationMins % 60)}m</div>}
                  </header>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">Deployment</span>
                           <span className="text-[10px] font-black text-gray-400">{formatTime(session.checkIn.logged_at, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs font-black text-gray-800 leading-tight">{session.checkInAddress}</p>
                        <p className="text-[11px] text-gray-500 italic bg-gray-50 p-3 rounded-xl">&quot;{session.checkIn.task_description}&quot;</p>
                     </div>

                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">Completion</span>
                           <span className="text-[10px] font-black text-gray-400">{session.checkOut ? formatTime(session.checkOut.logged_at, { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                        </div>
                        {session.checkOut ? (
                          <>
                            <p className="text-xs font-black text-gray-800 leading-tight">{session.checkOutAddress}</p>
                            <p className="text-[11px] text-blue-600 font-bold bg-blue-50 p-3 rounded-xl border border-blue-100 italic">&quot;{session.checkOut.closing_remarks}&quot;</p>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 py-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active Duty / Logged In</span>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  )
}

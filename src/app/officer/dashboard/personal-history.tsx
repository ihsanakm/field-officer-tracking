'use client'

import React from 'react'

interface LogEntry {
  id: string
  type: 'check_in' | 'check_out'
  logged_at: string
  task_description: string | null
  closing_remarks: string | null
}

export function PersonalHistory({ history }: { history: LogEntry[] }) {
  // Logic to calculate shift durations
  const calculateDurations = (logs: LogEntry[]) => {
    const sessions: Record<string, { checkIn: LogEntry, checkOut?: LogEntry, durationMins?: number }> = {}
    const sorted = [...logs].sort((a,b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    
    let lastCheckIn: LogEntry | null = null
    sorted.forEach(log => {
      if (log.type === 'check_in') {
        lastCheckIn = log
        sessions[log.id] = { checkIn: log }
      } else if (log.type === 'check_out' && lastCheckIn) {
        const inTime = new Date(lastCheckIn.logged_at).getTime()
        const outTime = new Date(log.logged_at).getTime()
        const diffMins = Math.round((outTime - inTime) / 60000)
        sessions[lastCheckIn.id] = { 
          ...sessions[lastCheckIn.id], 
          checkOut: log, 
          durationMins: diffMins 
        }
        lastCheckIn = null
      }
    })
    return sessions
  }

  const sessionData = calculateDurations(history)
  const totalMins = Object.values(sessionData).reduce((sum, s) => sum + (s.durationMins || 0), 0)
  const totalHours = (totalMins / 60).toFixed(1)

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">30-Day Activity Log</h3>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">{history.length} events logged this month</p>
        </div>
        <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm border-gray-100">
          <span className="text-xs font-bold text-slate-900">{totalHours} Hours Worked</span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-50">
        {history.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400 font-medium italic">
            No activity recorded in the last 30 days.
          </div>
        ) : (
          history.map((log) => {
            const session = sessionData[log.id]
            const durationText = session?.durationMins ? `${Math.floor(session.durationMins/60)}h ${session.durationMins%60}m` : null

            return (
              <div key={log.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-gray-50/30 transition-colors group">
                {/* Type and Time Column */}
                <div className="flex items-center gap-4 min-w-[160px]">
                  <span className={`text-[11px] w-24 text-center font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg shrink-0 ${
                    log.type === 'check_in' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {log.type === 'check_in' ? 'Check In' : 'Check Out'}
                  </span>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-900 leading-none mb-1">
                      {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 leading-none">
                      {new Date(log.logged_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                {/* Task Description / Duration Column */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    {log.type === 'check_in' && log.task_description && (
                      <>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Task Description</span>
                        <p className="text-xs text-gray-600 font-medium line-clamp-2 italic">
                          &quot;{log.task_description}&quot;
                        </p>
                      </>
                    )}
                    {log.type === 'check_out' && log.closing_remarks && (
                      <>
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-tighter">Closing Remarks</span>
                        <p className="text-xs text-blue-600 font-bold bg-blue-50/30 px-3 py-2 rounded-xl border border-blue-50/50 italic">
                          &quot;{log.closing_remarks}&quot;
                        </p>
                      </>
                    )}
                    {log.type === 'check_out' && !log.closing_remarks && (
                       <p className="text-[10px] italic text-gray-400 font-medium italic">Assigned Mission Complete</p>
                    )}
                  </div>
                  
                  {log.type === 'check_in' && durationText && (
                    <div className="bg-gray-100/50 group-hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-transparent group-hover:border-blue-100 transition-all flex flex-col items-center shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-blue-500">Working Time</span>
                      <span className="text-xs font-black text-gray-700 group-hover:text-blue-700">{durationText}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

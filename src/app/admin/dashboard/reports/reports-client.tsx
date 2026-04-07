'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/CheckboxUI'
import { getGlobalHistory } from '@/app/actions/admin'
import { getHumanAddress } from '@/lib/geo'
import * as XLSX from 'xlsx'

interface Officer {
  id: string
  full_name: string
  email: string
}

export function ReportsClient({ officers }: { officers: Officer[] }) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)

  const filtered = officers.filter(o => 
    o.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(o => o.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleExport = async () => {
    setLoading(true)
    setProgress('Fetching Mission Archive...')
    
    // 1. Fetch relevant logs
    const { history, error } = await getGlobalHistory(Array.from(selectedIds))
    if (error) {
       alert('Mission Connection Failure: ' + error)
       setLoading(false)
       setProgress(null)
       return
    }

    setProgress('Pairing Mission Sessions...')
    const userMap: Record<string, any[]> = {}
    history?.forEach(log => {
      if (!userMap[log.user_id]) userMap[log.user_id] = []
      userMap[log.user_id].push(log)
    })

    const allSessions: any[] = []
    for (const userId in userMap) {
      const sorted = userMap[userId].sort((a,b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
      let lastIn: any = null
      
      for (const log of sorted) {
        if (log.type === 'check_in') {
          lastIn = log
        } else if (log.type === 'check_out' && lastIn) {
          const inTime = new Date(lastIn.logged_at)
          const outTime = new Date(log.logged_at)
          const duration = (outTime.getTime() - inTime.getTime()) / 60000

          allSessions.push({
            name: (log.users as any)?.full_name || 'Anonymous',
            email: (log.users as any)?.email || 'Unknown',
            date: inTime.toLocaleDateString(),
            checkInTime: inTime.toLocaleTimeString(),
            checkOutTime: outTime.toLocaleTimeString(),
            durationHours: (duration / 60).toFixed(2),
            task: lastIn.task_description,
            remarks: log.closing_remarks,
            inLat: lastIn.latitude,
            inLon: lastIn.longitude,
            outLat: log.latitude,
            outLon: log.longitude
          })
          lastIn = null
        }
      }
    }

    if (allSessions.length === 0) {
      alert('Strategic State: No completed sessions found. (Ensure workers have checked out)')
      setLoading(false)
      setProgress(null)
      return
    }

    setProgress('Decoding Mission Geographies...')
    const geoCache: Record<string, string> = {}
    const finalData = []
    let count = 0
    for (const s of allSessions) {
      count++
      setProgress(`${Math.round((count/allSessions.length)*100)}% Decoded...`)
      
      const inKey = `${s.inLat},${s.inLon}`;
      const outKey = `${s.outLat},${s.outLon}`;
      
      if (!geoCache[inKey]) geoCache[inKey] = await getHumanAddress(s.inLat, s.inLon);
      if (!geoCache[outKey]) geoCache[outKey] = await getHumanAddress(s.outLat, s.outLon);
      
      finalData.push({
        'Aid Worker': s.name,
        'Worker Email': s.email,
        'Mission Date': s.date,
        'Worked Hours': s.durationHours,
        'Start Time (In)': s.checkInTime,
        'Start Sector (In)': geoCache[inKey],
        'End Time (Out)': s.checkOutTime,
        'End Sector (Out)': geoCache[outKey],
        'Assignment Objective': s.task || 'Routine Duty',
        'Mission Remarks': s.remarks || 'Mission Success'
      })
    }

    setProgress('Finalizing Spreadsheet...')
    const ws = XLSX.utils.json_to_sheet(finalData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Field Mission Report')
    XLSX.writeFile(wb, `MuslimAid_Field_Report_${new Date().toISOString().split('T')[0]}.xlsx`)

    setLoading(false)
    setProgress(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md group">
           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">Search</span>
           </div>
           <Input 
             className="pl-[4.5rem] rounded-2xl border-none shadow-xl shadow-gray-200/40 bg-white h-12 font-bold placeholder:font-medium transition-all focus:ring-4 focus:ring-blue-500/10"
             placeholder="Find field staff to review..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-4">
           <Button 
             onClick={handleExport} 
             disabled={loading || selectedIds.size === 0}
             className="bg-slate-900 hover:bg-black text-white rounded-xl px-8 h-12 font-bold uppercase text-[11px] tracking-wider shadow-lg shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50"
           >
             {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span>{progress}</span>
                </div>
             ) : `Export Archive (${selectedIds.size})`}
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/30 border-none overflow-hidden pb-4">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-[50px] px-8">
                  <Checkbox 
                    checked={selectedIds.size === filtered.length && filtered.length > 0} 
                    onCheckedChange={toggleAll}
                    className="border-gray-300"
                  />
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Worker Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Worker Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-48 text-gray-400 italic font-medium">
                    No matching personnel found in the archive.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((o) => (
                  <TableRow key={o.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => toggleOne(o.id)}>
                    <TableCell className="px-8" onClick={(e) => e.stopPropagation()}>
                       <Checkbox 
                         checked={selectedIds.has(o.id)} 
                         onCheckedChange={() => toggleOne(o.id)}
                         className="border-gray-300"
                       />
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="font-bold text-slate-900 leading-tight">{o.full_name}</div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-semibold text-xs tracking-tight">{o.email}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

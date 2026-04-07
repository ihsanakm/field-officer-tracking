'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { updateOfficer, deleteOfficer, createOfficer, resetUserPassword } from '@/app/actions/admin'
import Link from 'next/link'

interface Officer {
  id: string
  full_name: string | null
  email: string
  role: string
}

export function PersonnelClient({ officers: initialOfficers }: { officers: Officer[] }) {
  const [officers, setOfficers] = useState(initialOfficers)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('Welcome#2026')
  const [newRole, setNewRole] = useState('officer')
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const filtered = officers.filter(o => 
    o.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
     setLoading(true)
     setErrorAlert(null)
     const res = await createOfficer(newEmail, newName, newRole, newPassword)
     if (res.error) {
       setErrorAlert(res.error)
     } else {
       setShowAdd(false)
       setNewName('')
       setNewEmail('')
       setNewPassword('Welcome#2026')
       window.alert('Personnel successfully created. Profile will appear in roster briefly.')
     }
     setLoading(false)
  }

  const handleResetPassword = async (id: string) => {
    const pass = window.prompt('Enter new password for this personnel:', 'Reset#2026')
    if (!pass) return
    
    setLoading(true)
    const res = await resetUserPassword(id, pass)
    if (res.success) {
      window.alert('Credential restoration successful. New cipher is active.')
    } else {
      window.alert('Restoration Failed: ' + res.error)
    }
    setLoading(false)
  }

  const handleEdit = (o: Officer) => {
    setEditingId(o.id)
    setEditName(o.full_name || '')
    setEditRole(o.role || 'officer')
  }

  const saveEdit = async () => {
    if (!editingId) return
    setLoading(true)
    const res = await updateOfficer(editingId, { full_name: editName, role: editRole })
    if (res.success) {
      setOfficers(prev => prev.map(o => o.id === editingId ? { ...o, full_name: editName, role: editRole } : o))
      setEditingId(null)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user from the roster?')) return
    setLoading(true)
    const res = await deleteOfficer(id)
    if (res.success) {
      setOfficers(prev => prev.filter(o => o.id !== id))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md group">
           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Search</span>
           </div>
           <Input 
             className="pl-[4.5rem] rounded-2xl border-none shadow-xl shadow-gray-200/40 bg-white h-12 font-bold placeholder:font-medium transition-all focus:ring-4 focus:ring-blue-500/10"
             placeholder="Find personnel by name or email..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-50">
              {filtered.length} Personnel Active
           </div>
           <Button 
             onClick={() => setShowAdd(!showAdd)} 
             className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-900/10 active:scale-95 transition-all"
           >
             {showAdd ? 'Cancel' : 'Add New Personnel'}
           </Button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 p-8 border-2 border-blue-100/50 space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Onboard New Aid Worker</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Profile Identity Setup</p>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                 <Input value={newName} onChange={e => setNewName(e.target.value)} className="rounded-xl border-gray-100 bg-gray-50/50 h-10 font-bold text-xs" placeholder="e.g. Sgt. Johnson" />
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Work Email</label>
                 <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} className="rounded-xl border-gray-100 bg-gray-50/50 h-10 font-bold text-xs" placeholder="johnson@muslimaid.org" />
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Initial Password</label>
                 <Input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="text" className="rounded-xl border-gray-100 bg-gray-50/50 h-10 font-bold text-xs" placeholder="Welcome#2026" />
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Access Level</label>
                 <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full h-10 rounded-xl border-gray-100 bg-gray-50/50 px-3 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-100 leading-none">
                    <option value="officer">Field Officer</option>
                    <option value="admin">System Admin</option>
                 </select>
              </div>
           </div>
           {errorAlert && (
              <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-5 rounded-[2rem] flex items-start gap-4 shadow-xl shadow-rose-500/5">
                 <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                    <span className="text-white font-black text-lg">!</span>
                 </div>
                 <div className="space-y-1 text-left">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400">System Notification</h4>
                   <p className="text-xs font-bold leading-relaxed">{errorAlert}</p>
                 </div>
              </div>
           )}
           <Button onClick={handleCreate} disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-gray-900/20 active:scale-[0.98] transition-all">Register & Issue Access</Button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/30 border-none overflow-hidden pb-4">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="px-8 py-6 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Worker Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Access Identity</TableHead>
                <TableHead className="text-right px-8 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Mission Roster Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-48 text-gray-400 italic font-medium">
                    No matching personnel detected.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((officer) => (
                  <TableRow key={officer.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="px-8 py-6">
                       {editingId === officer.id ? (
                         <div className="flex flex-col gap-2">
                           <Input 
                             value={editName} 
                             onChange={(e) => setEditName(e.target.value)} 
                             className="h-8 rounded-lg text-xs font-bold" 
                             placeholder="Full Name"
                           />
                           <select 
                             value={editRole} 
                             onChange={(e) => setEditRole(e.target.value)}
                             className="h-8 rounded-lg text-[10px] font-black uppercase bg-gray-50 border-none focus:ring-2 focus:ring-blue-100"
                           >
                             <option value="officer">Officer</option>
                             <option value="admin">Admin</option>
                           </select>
                         </div>
                       ) : (
                         <>
                           <div className="font-bold text-slate-900 leading-tight">{officer.full_name || 'Unnamed Worker'}</div>
                           <div className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${officer.role === 'admin' ? 'text-blue-500' : 'text-green-500'}`}>
                              {officer.role?.toUpperCase() || 'OFFICER'} Level Access
                           </div>
                         </>
                       )}
                    </TableCell>
                    <TableCell className="text-slate-500 font-bold text-[11px] tracking-tight">{officer.email}</TableCell>
                    <TableCell className="text-right px-8">
                       <div className="flex items-center justify-end gap-2">
                         {editingId === officer.id ? (
                           <>
                             <Button onClick={saveEdit} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black uppercase">Save</Button>
                             <Button onClick={() => setEditingId(null)} disabled={loading} size="sm" variant="ghost" className="text-gray-400 rounded-xl text-[10px] font-black uppercase">Cancel</Button>
                           </>
                         ) : (
                           <>
                             <Link href={`/admin/dashboard/employee/${officer.id}`}>
                               <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-50 rounded-xl">Logs</Button>
                             </Link>
                             <Button onClick={() => handleEdit(officer)} variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-xl">Edit</Button>
                             <Button onClick={() => handleResetPassword(officer.id)} variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-50 rounded-xl">Reset Pass</Button>
                             <Button onClick={() => handleDelete(officer.id)} variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl">Offboard</Button>
                           </>
                         )}
                       </div>
                    </TableCell>
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

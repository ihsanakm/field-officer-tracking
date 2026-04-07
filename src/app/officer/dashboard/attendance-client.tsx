'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { logAttendance } from '@/app/actions/attendance'

export function AttendanceClient({ initialStatus, fullName }: { initialStatus: string; fullName?: string }) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [taskDescription, setTaskDescription] = useState('')
  const [closingRemarks, setClosingRemarks] = useState('')
  
  const handleAttendance = async (type: 'check_in' | 'check_out') => {
    setLoading(true)
    setErrorMsg(null)

    if (type === 'check_in' && taskDescription.trim() === '') {
      setErrorMsg('Please describe your task for the day before checking in.')
      setLoading(false)
      return
    }

    if (type === 'check_out' && closingRemarks.trim() === '') {
      setErrorMsg('Please provide mission closing remarks before checking out.')
      setLoading(false)
      return
    }

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        try {
          const res = await logAttendance(type, latitude, longitude, accuracy, taskDescription, closingRemarks)
          if (res?.error) {
            setErrorMsg(res.error)
          } else {
            // Success - Clear fields
            setTaskDescription('')
            setClosingRemarks('')
            window.location.reload() // Force status refresh
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Unknown error occurred')
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        setErrorMsg('Location permission denied. Please enable GPS to log attendance.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const isCheckedIn = initialStatus === 'check_in'

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-sm mx-auto space-y-8">
      {/* Visual Header / Welcome */}
      <div className="text-center space-y-2">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] mb-1">Authenticated Officer</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Welcome, <span className="text-green-600">{fullName || 'Personnel'}</span>
          </h1>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold text-gray-700">
            {isCheckedIn ? 'End Your Mission' : 'Start Your Mission'}
          </h2>
          <p className="text-sm text-slate-500 font-medium italic">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-5 rounded-[2rem] w-full flex items-start gap-4 animate-in fade-in slide-in-from-top-4 shadow-xl shadow-rose-500/5">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20 mt-0.5">
             <span className="text-white font-black text-lg leading-none">!</span>
          </div>
          <div className="space-y-1">
             <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-400">System Notification</h4>
             <p className="text-sm font-bold leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 flex flex-col items-center gap-8">
        {isCheckedIn ? (
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="w-full text-left space-y-3">
              <label className="text-sm font-bold text-gray-800 flex justify-between items-center px-1">
                <span>Closing Remarks</span>
                <span className="text-[10px] uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold">Required</span>
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Summary of today's activities and any critical incident reports..."
                value={closingRemarks}
                onChange={(e) => setClosingRemarks(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <button 
              onClick={() => handleAttendance('check_out')}
              disabled={loading || closingRemarks.trim().length < 5}
              className="group relative w-48 h-48 flex items-center justify-center rounded-full bg-red-500 text-white text-2xl font-extrabold shadow-2xl shadow-red-500/40 active:scale-95 transition-all hover:bg-red-600 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden"
            >
              {loading && <div className="absolute inset-0 bg-black/10 animate-pulse" />}
              {loading ? (
                <div className="flex flex-col items-center gap-1">
                   <span className="text-sm font-black animate-pulse">TRANSMITTING</span>
                   <span className="text-3xl">...</span>
                </div>
              ) : 'CHECK OUT'}
            </button>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-semibold">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active Field Mission
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full items-center gap-8">
            <div className="w-full text-left space-y-3">
              <label className="text-sm font-bold text-gray-800 flex justify-between items-center px-1">
                <span>Task Description</span>
                <span className="text-[10px] uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold">Required</span>
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Briefly describe your objectives or current location task..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <button 
              onClick={() => handleAttendance('check_in')}
              disabled={loading || taskDescription.trim().length < 5}
              className="group relative w-48 h-48 flex items-center justify-center rounded-full bg-green-500 text-white text-2xl font-extrabold shadow-2xl shadow-green-500/40 active:scale-95 transition-all hover:bg-green-600 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden"
            >
              {loading && <div className="absolute inset-0 bg-black/10 animate-pulse" />}
              {loading ? (
                <div className="flex flex-col items-center gap-1">
                   <span className="text-sm font-black animate-pulse">FINDING GPS</span>
                   <span className="text-3xl">...</span>
                </div>
              ) : 'CHECK IN'}
            </button>
            {taskDescription.trim().length < 5 && taskDescription.trim().length > 0 && (
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-in fade-in">Min. 5 characters required</p>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-1 w-full border-t border-slate-50 pt-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Status</p>
          <span className={`text-xl font-bold ${isCheckedIn ? 'text-green-600' : 'text-slate-400'}`}>
            {isCheckedIn ? 'In Field' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="text-center px-4">
        <p className="text-[10px] leading-relaxed text-gray-400 font-medium italic">
          <strong>Privacy Compliance:</strong> Your GPS location is anonymously secured solely for field verification and remains restricted to MuslimAid administrator personnel only.
        </p>
      </div>
    </div>
  )
}

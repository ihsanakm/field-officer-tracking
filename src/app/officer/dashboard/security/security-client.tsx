'use client'

import { useState } from 'react'
import { changePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SecurityClient() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await changePassword(password)
    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <main className="flex-1 flex flex-col items-center py-12 px-4 gap-8">
      <div className="text-center space-y-2">
         <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Security Command</h2>
         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed italic">Internal Cipher Cryptography</p>
      </div>

      <Card className="w-full max-w-sm border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in duration-500">
         <CardHeader className="pt-10 px-10 pb-4">
            <CardTitle className="text-xl font-black tracking-tight text-gray-900">Update Access Token</CardTitle>
            <CardDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 leading-relaxed">
               Modify your private password without email verification
            </CardDescription>
         </CardHeader>
         <CardContent className="p-10 pt-0">
            <form onSubmit={handleUpdate} className="grid gap-6">
              {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-5 py-4 rounded-3xl text-sm font-bold animate-shake text-center">{error}</div>
              )}
              {success && (
                <div className="bg-emerald-50 border-2 border-emerald-100 text-emerald-700 px-5 py-4 rounded-3xl text-sm font-bold text-center animate-in fade-in">Success! Your new cipher is active.</div>
              )}
              
              <div className="grid gap-3 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Password</Label>
                <Input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading} 
                  className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold no-scrollbar placeholder:text-gray-300"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-3 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Cipher</Label>
                <Input 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading} 
                  className="rounded-2xl border-gray-100 bg-gray-50/50 h-12 font-bold no-scrollbar placeholder:text-gray-300"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-gray-900/10 active:scale-[0.98]" disabled={loading}>
                {loading ? 'Transmitting...' : 'Update Security Token'}
              </Button>
            </form>
         </CardContent>
      </Card>

      <div className="max-w-xs text-center px-4">
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed italic opacity-60">
            Note: Internal updates bypass standard relay protocols and do not consume master authentication quetos.
         </p>
      </div>
    </main>
  )
}

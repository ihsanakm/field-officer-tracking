'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [sessionActive, setSessionActive] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verify we have a recovery session from the email link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionActive(true)
      } else {
        // If no session is found, they might have clicked an expired link or landed here directly
        setError('Recovery session expired or not found. Please request a new link.')
      }
    }
    checkSession()
  }, [supabase.auth])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Password entries do not match.')
      return
    }
    
    setLoading(true)
    setError(null)
    setMessage(null)
    
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully. Access credentials restored.')
      // Immediate clean sign-out to force a clean login with new credentials
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-200/50">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Credential Restoration</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Secure Access Protocol Step 2</p>
        </div>
        
        <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="pt-10 px-10 pb-4">
            <CardTitle className="text-xl font-black tracking-tight text-gray-900">Set New Credentials</CardTitle>
            <CardDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
              Select a robust password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleUpdate} className="grid gap-6">
              {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-5 py-4 rounded-3xl text-xs font-bold animate-shake text-center">{error}</div>
              )}
              {message && (
                <div className="bg-emerald-50 border-2 border-emerald-100 text-emerald-700 px-5 py-4 rounded-3xl text-xs font-bold text-center animate-in fade-in">{message}</div>
              )}
              
              {sessionActive && !message && (
                <>
                  <div className="grid gap-3 text-left">
                    <Label htmlFor="pass" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">New Password</Label>
                    <Input 
                      id="pass" 
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
                    <Label htmlFor="confirm" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Identity Password</Label>
                    <Input 
                      id="confirm" 
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
                    {loading ? 'Restoring...' : 'Restore Account Access'}
                  </Button>
                </>
              )}

              {!sessionActive && !loading && !message && (
                 <Link href="/login" className="w-full h-12 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest transition-all">Request Fresh Recovery Link</Link>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('A secure recovery link has been dispatched to your corporate email.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-200/50">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Credential Recovery</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Secure Access Protocol Step 1</p>
        </div>
        
        <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="pt-10 px-10 pb-4">
            <CardTitle className="text-xl font-black tracking-tight text-gray-900">Request Reset</CardTitle>
            <CardDescription className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
              Enter your identity email to receive a secure link
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleReset} className="grid gap-6">
              {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-5 py-4 rounded-3xl text-xs font-bold animate-shake text-center">{error}</div>
              )}
              {message && (
                <div className="bg-emerald-50 border-2 border-emerald-100 text-emerald-700 px-5 py-4 rounded-3xl text-xs font-bold text-center animate-in fade-in">{message}</div>
              )}
              <div className="grid gap-3 text-left">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading} 
                  className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all h-12 font-bold no-scrollbar placeholder:font-medium"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-gray-900/10 active:scale-[0.98]" disabled={loading}>
                {loading ? 'Dispatching...' : 'Dispatch Recovery link'}
              </Button>
              <Link href="/login" className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Return to Login</Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    const formData = new FormData(e.currentTarget)
    try {
      const res = await login(formData)
      if (res?.error) {
        setErrorMsg(res.error)
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-200/50">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">MuslimAid</h1>
          <p className="text-gray-500 font-medium italic">Log in to manage aid deployment</p>
        </div>
        
        <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="pt-10 px-10 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500 font-bold uppercase text-[11px] tracking-wider mt-1">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleSubmit} className="grid gap-8">
              {errorMsg && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-5 py-4 rounded-3xl text-xs font-bold animate-shake text-center">
                  {errorMsg}
                </div>
              )}
              <div className="grid gap-3 text-left">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Identity Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  required 
                  disabled={loading} 
                  className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all h-12 font-bold no-scrollbar placeholder:font-medium"
                />
              </div>
              <div className="grid gap-3 text-left">
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Account Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  disabled={loading} 
                  className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all h-12 font-bold no-scrollbar"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold uppercase text-[11px] tracking-wider transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : 'Authenticate Access'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
          Humanitarian Mission Operational Platform<br/>
          &copy; {new Date().getFullYear()} MuslimAid Global
        </p>
      </div>
    </div>
  )
}

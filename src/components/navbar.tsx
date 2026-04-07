'use client'

import React from 'react'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

interface NavProps {
  role: 'admin' | 'officer'
  fullName?: string
}

export function Navbar({ role, fullName }: NavProps) {
  const pathname = usePathname()

  const officerLinks = [
    { label: 'Portal', href: '/officer/dashboard' },
    { label: 'My History', href: '/officer/dashboard/history' },
  ]

  const adminLinks = [
    { label: 'HR Command', href: '/admin/dashboard' },
    { label: 'Personnel', href: '/admin/dashboard/personnel' },
    { label: 'Reports', href: '/admin/dashboard/reports' },
  ]

  const links = role === 'admin' ? adminLinks : officerLinks

  // Robust path matching to handle trailing slashes or redirect inconsistencies
  const isLinkActive = (href: string) => {
    if (!pathname) return false
    const cleanPathname = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
    const cleanHref = href === '/' ? '/' : href.replace(/\/$/, '')
    return cleanPathname === cleanHref
  }

  return (
    <header className="sticky top-0 z-50 w-full animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Main Bar */}
      <div className="mx-3 md:mx-6 mt-3 md:mt-4 mb-2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-gray-200/50 rounded-[2rem] md:rounded-[2.5rem] px-5 md:px-8 py-3 md:py-4 flex items-center justify-between">
        
        {/* Brand/Logo Area */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-500">
             <div className="absolute inset-0 bg-green-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl ${role === 'admin' ? 'bg-blue-600' : 'bg-green-500'} flex items-center justify-center shadow-lg transform rotate-3`}>
               <span className="text-white font-black text-lg md:text-xl tracking-tighter shrink-0">MA</span>
             </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-xl text-slate-900 tracking-tight leading-none whitespace-nowrap">MuslimAid</h1>
            <p className="hidden xs:block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1">
              {role === 'admin' ? 'Admin Intelligence' : 'Officer Portal'}
            </p>
          </div>
        </div>

        {/* Desktop Links (Hidden on small screens) */}
        <nav className="hidden lg:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/20 mx-4">
          {links.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <Link key={link.href} href={link.href}>
                <div className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                }`}>
                  {link.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Action/User Area */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden xl:flex flex-col items-end shrink-0">
            <span className="text-xs font-bold text-slate-900">{fullName}</span>
          </div>

          <form action={logout} className="shrink-0">
            <button 
              type="submit"
              className="bg-gray-900 hover:bg-black text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-900/10 active:scale-95 border border-white/10"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Sub-Navigation (Horizontal Scroll) */}
      <div className="lg:hidden mx-4 pb-2">
        <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl p-1 flex items-center overflow-x-auto no-scrollbar gap-1 scroll-smooth">
          {links.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <Link key={link.href} href={link.href} className="shrink-0">
                <div className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-md border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}>
                  {link.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}

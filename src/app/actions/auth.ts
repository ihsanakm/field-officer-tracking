'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Next.js middleware will handle the redirect to correct dashboard
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  redirect('/login')
}

export async function changePassword(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}
export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

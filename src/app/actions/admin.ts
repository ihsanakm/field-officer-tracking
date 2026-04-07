'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  const { count: totalOfficers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'officer')

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { data: todayLogs } = await supabase
    .from('attendance_logs')
    .select('user_id, type, logged_at, users!inner(role)')
    .eq('users.role', 'officer')
    .gte('logged_at', today.toISOString())
    .order('logged_at', { ascending: true })

  let presentToday = 0
  let pendingLogout = 0

  if (todayLogs) {
    const userLogins = new Map()
    for (const log of todayLogs) {
      if (!userLogins.has(log.user_id)) {
        userLogins.set(log.user_id, { checkIn: null, checkOut: null })
      }
      const entry = userLogins.get(log.user_id)
      if (log.type === 'check_in') entry.checkIn = log.logged_at
      if (log.type === 'check_out') entry.checkOut = log.logged_at
    }

    presentToday = userLogins.size
    for (const [id, entry] of Array.from(userLogins.entries())) {
      if (entry.checkIn && !entry.checkOut) pendingLogout++
    }
  }

  const absentToday = Math.max(0, (totalOfficers || 0) - presentToday)
  const checkedOutToday = presentToday - pendingLogout

  return {
    totalOfficers: totalOfficers || 0,
    checkedIn: pendingLogout,
    checkedOut: checkedOutToday,
    absentToday: absentToday,
  }
}

import { createAdminClient } from '@/lib/supabase/admin'

export async function createOfficer(email: string, fullName: string, role: string, password?: string) {
  try {
    const admin = createAdminClient()
    
    // 1. Force the Creation of the Master Auth Account with chosen password
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: password || 'Welcome#2026', // High-sec default if missing
      user_metadata: { 
        full_name: fullName, 
        role: role 
      },
      email_confirm: true
    })

    if (error) return { error: error.message }
    
    return { success: true }
  } catch (err: any) {
    return { error: 'Master Key Error: Ensure SUPABASE_SERVICE_ROLE_KEY is correctly set in .env.local.' }
  }
}

export async function updateOfficer(userId: string, data: { full_name?: string, role?: string }) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
  
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteOfficer(userId: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  
  // 1. Delete the public profile role first
  const { error: profileError } = await supabase.from('users').delete().eq('id', userId)
  if (profileError) return { error: profileError.message }

  // 2. Delete the master Auth credentials safely
  const { error: authError } = await admin.auth.admin.deleteUser(userId)
  if (authError) return { error: authError.message }

  return { success: true }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) return { error: error.message }
    return { success: true }
  } catch (err: any) {
    return { error: 'Master Key Error: Ensure SUPABASE_SERVICE_ROLE_KEY is correctly set in .env.local.' }
  }
}

export async function getOfficers(limit = 500) {
  const supabase = await createClient()
  
  // Fetch officers with their latest activity timestamp
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, attendance_logs(logged_at)')
    .eq('role', 'officer')
    .order('full_name', { ascending: true })
    .limit(limit)

  return { officers: data || [], error: error?.message }
}

export async function getRecentActivities(limit = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*, users(full_name, email)')
    .order('logged_at', { ascending: false })
    .limit(limit)
  
  return { activities: data || [], error: error?.message }
}

export async function getOfficerHistory(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
  
  return { history: data || [], error: error?.message }
}

export async function getGlobalHistory(userIds?: string[]) {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_logs')
    .select('*, users(full_name, email)')
    .order('logged_at', { ascending: false })

  if (userIds && userIds.length > 0) {
    query = query.in('user_id', userIds)
  }

  const { data, error } = await query
  return { history: data || [], error: error?.message }
}

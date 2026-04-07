'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCurrentStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'unauthenticated' }

  // Get start of today (UTC)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { data: logs, error } = await supabase
    .from('attendance_logs')
    .select('type')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .order('logged_at', { ascending: false })
    .limit(1)

  if (error || !logs || logs.length === 0) {
    return { status: 'check_out' } // Assumed checked out if no logs today
  }

  return { status: logs[0].type }
}

export async function logAttendance(
  type: 'check_in' | 'check_out',
  latitude: number,
  longitude: number,
  accuracy: number | null,
  taskDescription?: string,
  closingRemarks?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { status } = await getCurrentStatus()

  if (type === 'check_in' && status === 'check_in') {
    return { error: 'Already checked in' }
  }

  if (type === 'check_out' && status === 'check_out') {
    return { error: 'Not checked in yet' }
  }

  if (type === 'check_in' && (!taskDescription || taskDescription.trim() === '')) {
    return { error: 'Personnel must provide a task description to check in.' }
  }

  if (type === 'check_out' && (!closingRemarks || closingRemarks.trim() === '')) {
    return { error: 'Personnel must provide mission closing remarks to check out.' }
  }

  if (!latitude || !longitude) {
    return { error: 'Attendance cannot be logged without valid GPS coordinates.' }
  }

  // Inherit task description for checkouts
  let finalTaskDescription = taskDescription
  if (type === 'check_out' && !finalTaskDescription) {
    const { data: lastIn } = await supabase
      .from('attendance_logs')
      .select('task_description')
      .eq('user_id', user.id)
      .eq('type', 'check_in')
      .order('logged_at', { ascending: false })
      .limit(1)
      .single()
    
    if (lastIn?.task_description) finalTaskDescription = lastIn.task_description
  }

  const { error: insertError } = await supabase.from('attendance_logs').insert({
    user_id: user.id,
    type,
    latitude,
    longitude,
    accuracy,
    task_description: finalTaskDescription || null,
    closing_remarks: closingRemarks || null
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/officer/dashboard')
  return { success: true }
}

export async function getPersonalHistory(page = 1, pageSize = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { history: [], count: 0 }

  // Get date 30 days ago
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('attendance_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: false })
    .range(from, to)

  return { 
    history: data || [],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'

export async function getReportLogs(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorized' }
  
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  const { data: logs, error } = await supabase
    .from('attendance_logs')
    .select(`
      id,
      user_id,
      type,
      latitude,
      longitude,
      accuracy,
      logged_at,
      task_description,
      users ( id, full_name, email )
    `)
    .gte('logged_at', startDate)
    .lte('logged_at', endDate)
    .order('logged_at', { ascending: true })

  if (error) return { error: error.message }
  return { logs: logs || [] }
}

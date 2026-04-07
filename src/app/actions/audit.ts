'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logAudit(action: string, table_target: string, record_id: string, changes_summary: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action,
    table_target,
    record_id,
    changes_summary
  })
}

export async function createTeam(name: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('teams').insert({ name }).select().single()
  
  if (error) return { error: error.message }
  
  await logAudit('CREATE_TEAM', 'teams', data.id, { name })
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function updateUserStatus(userId: string, status: 'active' | 'disabled') {
  const supabase = await createClient()
  const { error } = await supabase.from('users').update({ status }).eq('id', userId)

  if (error) return { error: error.message }

  await logAudit('UPDATE_USER_STATUS', 'users', userId, { new_status: status })
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function assignUserToTeam(userId: string, teamId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('users').update({ team_id: teamId }).eq('id', userId)

  if (error) return { error: error.message }

  await logAudit('ASSIGN_TEAM', 'users', userId, { new_team_id: teamId })
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function getAuditLogs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, users!audit_logs_admin_id_fkey(full_name, email)')
    .order('created_at', { ascending: false })

  return { logs: data || [] }
}

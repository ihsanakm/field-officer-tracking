import { getCurrentStatus } from '@/app/actions/attendance'
import { getUserProfile } from '@/app/actions/auth'
import { AttendanceClient } from './attendance-client'
import { Navbar } from '@/components/navbar'

export default async function OfficerDashboard() {
  const { status } = await getCurrentStatus()
  const profile = await getUserProfile()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar role="officer" fullName={profile?.full_name} />

      <main className="flex-1 flex flex-col items-center py-12 px-4 gap-12 overflow-y-auto animate-in fade-in duration-500">
        <AttendanceClient initialStatus={status as string} fullName={profile?.full_name} />
      </main>
    </div>
  )
}

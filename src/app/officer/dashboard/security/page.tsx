import { getUserProfile } from '@/app/actions/auth'
import { Navbar } from '@/components/navbar'
import { SecurityClient } from './security-client'

export default async function SecurityPage() {
  const profile = await getUserProfile()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar role="officer" fullName={profile?.full_name} />
      <SecurityClient />
    </div>
  )
}

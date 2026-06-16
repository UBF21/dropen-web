import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { AdminRole } from '@/types'

interface AdminProfile {
  id: string
  role: AdminRole
  full_name: string | null
}

interface UseAdminResult {
  user: User | null
  profile: AdminProfile | null
  role: AdminRole | null
  loading: boolean
  signOut: () => Promise<void>
  can: (allowedRoles: AdminRole[]) => boolean
}

export function useAdmin(): UseAdminResult {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('id, role, full_name')
          .eq('id', session.user.id)
          .single()
        if (mounted) setProfile(data ?? null)
      }
      if (mounted) setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('id, role, full_name')
          .eq('id', session.user.id)
          .single()
        if (mounted) setProfile(data ?? null)
      } else {
        if (mounted) setProfile(null)
      }
      if (mounted) setLoading(false)
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  return {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    signOut: async () => { await supabase.auth.signOut() },
    can: (allowedRoles: AdminRole[]) => !!profile && allowedRoles.includes(profile.role),
  }
}

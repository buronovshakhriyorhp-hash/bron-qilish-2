'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profileRole: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profileRole: null,
  loading: true,
  signOut: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profileRole, setProfileRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      setProfileRole(data?.role ?? null)
    }

    // Mavjud sessiyani olish
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRole(session.user.id).finally(() => setLoading(false))
      } else {
        setProfileRole(null)
        setLoading(false)
      }
    })

    // Auth o'zgarishlarini kuzatish
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchRole(session.user.id)
        } else {
          setProfileRole(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfileRole(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, session, profileRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

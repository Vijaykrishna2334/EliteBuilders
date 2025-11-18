'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StartChallengeButton({ challengeId }: { challengeId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: insertError } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
        })

      if (insertError) throw insertError

      router.refresh()
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handleStart}
        disabled={loading}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Starting...' : 'Start Challenge'}
      </button>
    </div>
  )
}

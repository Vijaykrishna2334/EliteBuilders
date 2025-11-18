import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's challenge participations
  const { data: participations } = await supabase
    .from('challenge_participants')
    .select(`
      *,
      challenges (*)
    `)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  // Fetch user's submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      challenges (title),
      scores (total_score)
    `)
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name || 'Builder'}!</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your progress and continue building</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Active Challenges */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Active Challenges</h2>
              {participations && participations.length > 0 ? (
                <div className="space-y-4">
                  {participations.map((participation: any) => (
                    <div key={participation.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <Link
                        href={`/challenges/${participation.challenge_id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        {participation.challenges?.title}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Started {new Date(participation.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No active challenges. <Link href="/challenges" className="text-blue-600 dark:text-blue-400 hover:underline">Browse challenges</Link>
                </p>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
              {submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission: any) => (
                    <div key={submission.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{submission.challenges?.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        {submission.scores && submission.scores.length > 0 && (
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {submission.scores[0].total_score}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Status: <span className="font-semibold capitalize">{submission.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No submissions yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <Link
                href="/challenges"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Browse Challenges
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

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

  // Calculate stats
  const totalSubmissions = submissions?.length || 0
  const scoredSubmissions = submissions?.filter(s => s.scores && s.scores.length > 0) || []
  const avgScore = scoredSubmissions.length > 0
    ? Math.round(scoredSubmissions.reduce((sum, s) => sum + s.scores[0].total_score, 0) / scoredSubmissions.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome back, {profile?.full_name || 'Builder'}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Track your progress and continue building amazing MVPs</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">🚀</span>
                <span className="text-3xl font-bold">{participations?.length || 0}</span>
              </div>
              <p className="text-blue-100 font-semibold">Active Challenges</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">📊</span>
                <span className="text-3xl font-bold">{totalSubmissions}</span>
              </div>
              <p className="text-purple-100 font-semibold">Total Submissions</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">⭐</span>
                <span className="text-3xl font-bold">{avgScore}</span>
              </div>
              <p className="text-pink-100 font-semibold">Average Score</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* Active Challenges */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>🎯</span>
                  Active Challenges
                </h2>
              </div>
              <div className="p-6">
                {participations && participations.length > 0 ? (
                  <div className="space-y-4">
                    {participations.map((participation: any) => (
                      <div
                        key={participation.id}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-200 dark:border-gray-600"
                      >
                        <Link
                          href={`/challenges/${participation.challenge_id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-lg"
                        >
                          {participation.challenges?.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>📅</span>
                          <span>Started {new Date(participation.started_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No active challenges yet
                    </p>
                    <Link
                      href="/challenges"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      Browse Challenges
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>📝</span>
                  Recent Submissions
                </h2>
              </div>
              <div className="p-6">
                {submissions && submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.slice(0, 5).map((submission: any) => (
                      <div
                        key={submission.id}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {submission.challenges?.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>📅</span>
                              <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {submission.scores && submission.scores.length > 0 && (
                            <div className="text-right">
                              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {submission.scores[0].total_score}
                              </span>
                              <p className="text-xs text-gray-500">/ 100</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            submission.status === 'scored'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : submission.status === 'scoring'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {submission.status === 'scored' ? '✓ Scored' : submission.status === 'scoring' ? '⏳ Scoring' : submission.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-gray-600 dark:text-gray-400">No submissions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>⚡</span>
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/challenges"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                🚀 Browse Challenges
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-bold transition-all"
              >
                👤 View Profile
              </Link>
              <Link
                href="/leaderboard"
                className="px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-bold transition-all"
              >
                🏆 Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

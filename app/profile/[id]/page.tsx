import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch user's submissions with scores
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      challenges (title, id),
      scores (total_score, rubric_scores, repo_analysis, deck_analysis, video_analysis)
    `)
    .eq('user_id', id)
    .eq('status', 'scored')
    .order('submitted_at', { ascending: false })

  // Calculate stats
  const totalSubmissions = submissions?.length || 0
  const averageScore = totalSubmissions > 0
    ? Math.round(
        submissions!.reduce((sum, s) => {
          const score = s.scores && s.scores.length > 0 ? s.scores[0].total_score : 0
          return sum + score
        }, 0) / totalSubmissions
      )
    : 0
  const highestScore = totalSubmissions > 0
    ? Math.max(...submissions!.map((s) => s.scores && s.scores.length > 0 ? s.scores[0].total_score : 0))
    : 0

  // Get current user to check if this is their profile
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === id

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start gap-6">
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Builder'}
                  className="w-24 h-24 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {profile.full_name || 'Anonymous Builder'}
                    </h1>
                    {profile.github_username && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        @{profile.github_username}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-2xl">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Link
                      href="/profile/edit"
                      className="px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {totalSubmissions}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Submissions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {averageScore}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Avg Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {highestScore}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Best Score</p>
              </div>
            </div>
          </div>

          {/* Submissions Portfolio */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Portfolio</h2>

            {submissions && submissions.length > 0 ? (
              <div className="space-y-6">
                {submissions.map((submission) => {
                  const score = submission.scores && submission.scores.length > 0
                    ? submission.scores[0]
                    : null
                  const challenge = submission.challenges as any

                  return (
                    <div
                      key={submission.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            <Link
                              href={`/challenges/${submission.challenge_id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {challenge?.title || 'Challenge'}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        {score && (
                          <div className="text-right">
                            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                              {score.total_score}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">/ 100</p>
                          </div>
                        )}
                      </div>

                      {/* Links */}
                      <div className="flex gap-4 mb-4">
                        <a
                          href={submission.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          View Repository
                        </a>
                        <a
                          href={submission.deck_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          View Deck
                        </a>
                        <a
                          href={submission.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          Watch Demo
                        </a>
                      </div>

                      {/* Analysis (shown to profile owner only) */}
                      {isOwnProfile && score && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                          <details className="cursor-pointer">
                            <summary className="font-semibold text-gray-700 dark:text-gray-300">
                              View Detailed Feedback
                            </summary>
                            <div className="mt-4 space-y-3 text-sm">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                  Repository Analysis
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                  {score.repo_analysis}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                  Deck Analysis
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                  {score.deck_analysis}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                  Video Analysis
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                  {score.video_analysis}
                                </p>
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg text-center">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {isOwnProfile ? 'You haven\'t submitted any MVPs yet' : 'No submissions yet'}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/challenges"
                    className="inline-block mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    Browse Challenges
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

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
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-10">
            {/* Gradient Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

            <div className="px-8 pb-8">
              <div className="flex items-start gap-6 -mt-16 relative">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Builder'}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                    {profile.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 mt-16">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                        {profile.full_name || 'Anonymous Builder'}
                      </h1>
                      {profile.github_username && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <span>👤</span>
                          @{profile.github_username}
                        </p>
                      )}
                      {profile.company_name && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <span>💼</span>
                          {profile.company_name}
                        </p>
                      )}
                      {profile.bio && (
                        <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-2xl leading-relaxed">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                    {isOwnProfile && (
                      <Link
                        href="/profile/edit"
                        className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold"
                      >
                        ✏️ Edit Profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white text-center transform hover:scale-105 transition-transform">
                  <p className="text-4xl font-bold mb-2">{totalSubmissions}</p>
                  <p className="text-blue-100 font-semibold">Total Submissions</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white text-center transform hover:scale-105 transition-transform">
                  <p className="text-4xl font-bold mb-2">{averageScore}</p>
                  <p className="text-purple-100 font-semibold">Average Score</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white text-center transform hover:scale-105 transition-transform">
                  <p className="text-4xl font-bold mb-2">{highestScore}</p>
                  <p className="text-pink-100 font-semibold">Best Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions Portfolio */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Portfolio
            </h2>

            {submissions && submissions.length > 0 ? (
              <div className="grid gap-8">
                {submissions.map((submission) => {
                  const score = submission.scores && submission.scores.length > 0
                    ? submission.scores[0]
                    : null
                  const challenge = submission.challenges as any

                  return (
                    <div
                      key={submission.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                    >
                      {/* Card Header with Gradient */}
                      <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold mb-3">
                              <Link
                                href={`/challenges/${submission.challenge_id}`}
                                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {challenge?.title || 'Challenge'}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span>📅</span>
                              <span>Submitted {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}</span>
                            </div>
                          </div>
                          {score && (
                            <div className="text-right ml-6">
                              <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
                                <p className="text-3xl font-bold">{score.total_score}</p>
                                <p className="text-xs opacity-90">/ 100</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          <a
                            href={submission.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <span>📂</span>
                            Repository
                          </a>
                          <a
                            href={submission.deck_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-semibold"
                          >
                            <span>📊</span>
                            Deck
                          </a>
                          <a
                            href={submission.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-semibold"
                          >
                            <span>🎥</span>
                            Demo
                          </a>
                        </div>

                        {/* Analysis (shown to profile owner only) */}
                        {isOwnProfile && score && (
                          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
                            <details className="cursor-pointer group">
                              <summary className="font-bold text-lg text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors list-none flex items-center gap-2">
                                <span className="text-2xl">📋</span>
                                <span>View Detailed Feedback</span>
                                <svg className="w-5 h-5 ml-auto transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </summary>
                              <div className="mt-6 space-y-6">
                                <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600">
                                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <span>📂</span>
                                    Repository Analysis
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {score.repo_analysis}
                                  </p>
                                </div>
                                <div className="p-5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600">
                                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <span>📊</span>
                                    Deck Analysis
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {score.deck_analysis}
                                  </p>
                                </div>
                                <div className="p-5 rounded-xl bg-pink-50 dark:bg-pink-900/20 border-l-4 border-pink-600">
                                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <span>🎥</span>
                                    Video Analysis
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {score.video_analysis}
                                  </p>
                                </div>
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-16 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-700">
                <div className="text-6xl mb-4">📂</div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {isOwnProfile ? 'Your Portfolio is Empty' : 'No Submissions Yet'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isOwnProfile ? 'Start building amazing MVPs and showcase your work here' : 'This builder hasn\'t submitted any projects yet'}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/challenges"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 Browse Challenges
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

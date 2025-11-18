import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch challenge details
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (!challenge) {
    notFound()
  }

  // Fetch leaderboard using the view
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('challenge_id', id)
    .order('total_score', { ascending: false })
    .order('submitted_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/challenges/${id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
            >
              ← Back to Challenge
            </Link>
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-400">{challenge.title}</p>
          </div>

          {leaderboard && leaderboard.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Builder
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Links
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.user_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {index === 0 && (
                              <span className="text-2xl mr-2">🥇</span>
                            )}
                            {index === 1 && (
                              <span className="text-2xl mr-2">🥈</span>
                            )}
                            {index === 2 && (
                              <span className="text-2xl mr-2">🥉</span>
                            )}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {entry.avatar_url && (
                              <img
                                src={entry.avatar_url}
                                alt={entry.full_name || 'Builder'}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div>
                              <Link
                                href={`/profile/${entry.user_id}`}
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {entry.full_name || entry.github_username || 'Anonymous'}
                              </Link>
                              {entry.github_username && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  @{entry.github_username}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {entry.total_score}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">/100</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(entry.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <a
                              href={entry.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              title="View Repository"
                            >
                              Repo
                            </a>
                            <span className="text-gray-400">•</span>
                            <a
                              href={entry.deck_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              title="View Deck"
                            >
                              Deck
                            </a>
                            <span className="text-gray-400">•</span>
                            <a
                              href={entry.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              title="Watch Video"
                            >
                              Video
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No submissions yet. Be the first to submit!
              </p>
              <Link
                href={`/challenges/${id}`}
                className="inline-block mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
              >
                View Challenge
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

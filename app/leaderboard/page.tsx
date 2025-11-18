import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CareerLeaderboard({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch seasons
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false })

  // Get active season or selected season
  const selectedSeasonId = params.season || seasons?.find(s => s.status === 'active')?.id || null

  // Fetch career scores
  const { data: leaderboard } = await supabase
    .from('career_scores')
    .select(`
      *,
      profiles:user_id (
        full_name,
        github_username,
        avatar_url
      )
    `)
    .eq('season_id', selectedSeasonId)
    .order('rank', { ascending: true })
    .limit(100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Career Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Top builders ranked by cumulative performance across all challenges
            </p>
          </div>

          {/* Season Selector */}
          {seasons && seasons.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Season</label>
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                value={selectedSeasonId || ''}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  if (e.target.value) {
                    url.searchParams.set('season', e.target.value)
                  } else {
                    url.searchParams.delete('season')
                  }
                  window.location.href = url.toString()
                }}
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.status === 'active' ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Leaderboard */}
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
                        Total Score
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Challenges
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Avg Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {leaderboard.map((entry: any) => {
                      const profile = entry.profiles

                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {entry.rank === 1 && <span className="text-2xl mr-2">🥇</span>}
                              {entry.rank === 2 && <span className="text-2xl mr-2">🥈</span>}
                              {entry.rank === 3 && <span className="text-2xl mr-2">🥉</span>}
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {profile?.avatar_url && (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.full_name || 'Builder'}
                                  className="w-10 h-10 rounded-full"
                                />
                              )}
                              <div>
                                <Link
                                  href={`/profile/${entry.user_id}`}
                                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {profile?.full_name || profile?.github_username || 'Anonymous'}
                                </Link>
                                {profile?.github_username && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    @{profile.github_username}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {entry.total_score}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {entry.challenges_completed}
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {entry.avg_score ? entry.avg_score.toFixed(1) : '0'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No rankings yet for this season. Be the first to submit!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

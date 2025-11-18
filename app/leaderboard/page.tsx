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
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏆 Career Leaderboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Top builders ranked by cumulative performance across all challenges
            </p>
          </div>

          {/* Season Selector */}
          {seasons && seasons.length > 0 && (
            <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>📅</span>
                Season
              </label>
              <select
                className="w-full md:w-auto px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <div className="space-y-4">
              {/* Top 3 - Special Cards */}
              {leaderboard.slice(0, 3).map((entry: any, index) => {
                const profile = entry.profiles
                const gradients = [
                  'from-yellow-400 via-yellow-500 to-yellow-600',
                  'from-gray-300 via-gray-400 to-gray-500',
                  'from-orange-400 via-orange-500 to-orange-600'
                ]
                const medals = ['🥇', '🥈', '🥉']

                return (
                  <div
                    key={entry.id}
                    className={`relative bg-gradient-to-r ${gradients[index]} rounded-2xl shadow-2xl p-1 transform hover:scale-[1.02] transition-all`}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                      <div className="flex items-center gap-6">
                        <div className="text-6xl">{medals[index]}</div>
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Builder'}
                            className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-xl"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                            {profile?.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              href={`/profile/${entry.user_id}`}
                              className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {profile?.full_name || profile?.github_username || 'Anonymous'}
                            </Link>
                            <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-bold text-gray-700 dark:text-gray-300">
                              #{entry.rank}
                            </span>
                          </div>
                          {profile?.github_username && (
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span>👤</span>
                              @{profile.github_username}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-8">
                            <div>
                              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {entry.total_score}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {entry.challenges_completed}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Challenges</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {entry.avg_score ? entry.avg_score.toFixed(1) : '0'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Rest of Leaderboard - Table */}
              {leaderboard.length > 3 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                            Rank
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                            Builder
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                            Total Score
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                            Challenges
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                            Avg Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {leaderboard.slice(3).map((entry: any) => {
                          const profile = entry.profiles

                          return (
                            <tr
                              key={entry.id}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                  #{entry.rank}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {profile?.avatar_url ? (
                                    <img
                                      src={profile.avatar_url}
                                      alt={profile.full_name || 'Builder'}
                                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                                      {profile?.full_name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                  )}
                                  <div>
                                    <Link
                                      href={`/profile/${entry.user_id}`}
                                      className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {entry.total_score}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  {entry.challenges_completed}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  {entry.avg_score ? entry.avg_score.toFixed(1) : '0'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-16 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No Rankings Yet
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to submit and claim your spot on the leaderboard!
              </p>
              <Link
                href="/challenges"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Start Building
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

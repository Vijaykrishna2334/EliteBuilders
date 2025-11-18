import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('challenge_categories')
    .select('*')
    .order('name')

  // Build query for challenges
  let query = supabase
    .from('challenges')
    .select('*, challenge_categories(name, icon), profiles!sponsor_id(company_name)')
    .eq('status', 'active')

  // Apply category filter
  if (params.category) {
    query = query.eq('category_id', params.category)
  }

  // Apply search filter
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  const { data: challenges } = await query.order('created_at', { ascending: false })

  // Get user to check participation status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userParticipations: string[] = []
  if (user) {
    const { data: participations } = await supabase
      .from('challenge_participants')
      .select('challenge_id')
      .eq('user_id', user.id)

    userParticipations = participations?.map((p) => p.challenge_id) || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Active Challenges
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose a challenge, build an MVP, and prove your skills
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {challenges?.length || 0} Active
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                  🏷️ Category
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => {
                    const url = new URL(window.location.href)
                    if (e.target.value) {
                      url.searchParams.set('category', e.target.value)
                    } else {
                      url.searchParams.delete('category')
                    }
                    window.location.href = url.toString()
                  }}
                  defaultValue={params.category || ''}
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                  🔍 Search
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const search = formData.get('search') as string
                    const url = new URL(window.location.href)
                    if (search) {
                      url.searchParams.set('search', search)
                    } else {
                      url.searchParams.delete('search')
                    }
                    window.location.href = url.toString()
                  }}
                >
                  <input
                    type="text"
                    name="search"
                    placeholder="Search challenges..."
                    defaultValue={params.search || ''}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </form>
              </div>

              {/* Clear Filters */}
              {(params.category || params.search) && (
                <div className="flex items-end">
                  <Link
                    href="/challenges"
                    className="px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold"
                  >
                    ✕ Clear
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Challenges Grid */}
          {challenges && challenges.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {challenges.map((challenge) => {
                const isParticipating = userParticipations.includes(challenge.id)
                const deliverables = Array.isArray(challenge.deliverables)
                  ? challenge.deliverables
                  : []
                const category = challenge.challenge_categories as any
                const sponsor = challenge.profiles as any

                return (
                  <div
                    key={challenge.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transform hover:-translate-y-1"
                  >
                    {/* Card Header with Gradient */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

                    <div className="p-6">
                      {/* Tags Row */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {category && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-700">
                            <span className="text-base">{category.icon}</span>
                            {category.name}
                          </span>
                        )}
                        {isParticipating && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-300 dark:border-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            In Progress
                          </span>
                        )}
                        {sponsor?.company_name && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                            💼 {sponsor.company_name}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {challenge.title}
                      </h2>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 leading-relaxed">
                        {challenge.description}
                      </p>

                      {/* Prize Banner */}
                      {challenge.prize_amount && (
                        <div className="mb-5 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            <div>
                              <p className="text-yellow-900 dark:text-yellow-200 font-bold text-lg">
                                ${challenge.prize_amount.toLocaleString()} {challenge.prize_currency}
                              </p>
                              <p className="text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                                Prize Pool
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Deliverables */}
                      <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <span>📋</span>
                          Required Deliverables
                        </h3>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          {deliverables.slice(0, 3).map((item: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                              <span>{typeof item === 'string' ? item : item.name || 'Deliverable'}</span>
                            </li>
                          ))}
                          {deliverables.length > 3 && (
                            <li className="text-blue-600 dark:text-blue-400 font-semibold text-xs ml-5">
                              +{deliverables.length - 3} more deliverables
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        {challenge.deadline && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-lg">⏰</span>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {new Date(challenge.deadline).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs">Deadline</p>
                            </div>
                          </div>
                        )}
                        <Link
                          href={`/challenges/${challenge.id}`}
                          className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          View Challenge →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-16 rounded-2xl shadow-xl text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {params.category || params.search
                  ? 'No Challenges Found'
                  : 'No Active Challenges'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {params.category || params.search
                  ? 'Try adjusting your filters to find more challenges.'
                  : 'Check back soon for new challenges!'}
              </p>
              {(params.category || params.search) && (
                <Link
                  href="/challenges"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View All Challenges
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

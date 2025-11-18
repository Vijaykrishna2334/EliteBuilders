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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Active Challenges</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a challenge, build an MVP, and prove your skills
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
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
                <label className="block text-sm font-semibold mb-2">Search</label>
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  />
                </form>
              </div>

              {/* Clear Filters */}
              {(params.category || params.search) && (
                <div className="flex items-end">
                  <Link
                    href="/challenges"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Challenges Grid */}
          {challenges && challenges.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challenge) => {
                const isParticipating = userParticipations.includes(challenge.id)
                const deliverables = Array.isArray(challenge.deliverables)
                  ? challenge.deliverables
                  : []
                const category = challenge.challenge_categories as any

                return (
                  <div
                    key={challenge.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {category && (
                            <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
                              {category.icon} {category.name}
                            </span>
                          )}
                          {isParticipating && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm font-semibold">
                              In Progress
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {challenge.description}
                    </p>

                    {challenge.prize_amount && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
                        <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                          💰 Prize: ${challenge.prize_amount.toLocaleString()} {challenge.prize_currency}
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Deliverables:
                      </h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {deliverables.slice(0, 3).map((item: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{typeof item === 'string' ? item : item.name || 'Deliverable'}</span>
                          </li>
                        ))}
                        {deliverables.length > 3 && (
                          <li className="text-blue-600 dark:text-blue-400">
                            +{deliverables.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center">
                      {challenge.deadline && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          📅 {new Date(challenge.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <Link
                        href={`/challenges/${challenge.id}`}
                        className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                      >
                        View Challenge
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {params.category || params.search
                  ? 'No challenges found matching your filters.'
                  : 'No active challenges at the moment. Check back soon!'}
              </p>
              {(params.category || params.search) && (
                <Link
                  href="/challenges"
                  className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
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

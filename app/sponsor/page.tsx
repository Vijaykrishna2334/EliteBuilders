import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SponsorDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is sponsor or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'sponsor' && profile.role !== 'admin')) {
    redirect('/dashboard')
  }

  // Fetch sponsor's challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*, challenge_categories(name), submissions(count)')
    .eq('sponsor_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch stats
  const { count: totalChallenges } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', user.id)

  const { count: activeSubmissions } = await supabase
    .from('submissions')
    .select('challenges!inner(*)', { count: 'exact', head: true })
    .eq('challenges.sponsor_id', user.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Sponsor Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your challenges and view submissions
              </p>
            </div>
            <Link
              href="/sponsor/challenges/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
            >
              Create New Challenge
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                Total Challenges
              </h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {totalChallenges || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                Total Submissions
              </h3>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {activeSubmissions || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                Active Challenges
              </h3>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {challenges?.filter(c => c.status === 'active').length || 0}
              </p>
            </div>
          </div>

          {/* Challenges List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">Your Challenges</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {challenges && challenges.length > 0 ? (
                challenges.map((challenge: any) => (
                  <div key={challenge.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{challenge.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            challenge.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                              : challenge.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {challenge.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {challenge.description.substring(0, 150)}...
                        </p>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>📅 Deadline: {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'No deadline'}</span>
                          {challenge.prize_amount && (
                            <span>💰 Prize: ${challenge.prize_amount}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/sponsor/submissions?challenge=${challenge.id}`}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          View Submissions
                        </Link>
                        <Link
                          href={`/challenges/${challenge.id}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No challenges yet. Create your first challenge to get started!
                  </p>
                  <Link
                    href="/sponsor/challenges/new"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    Create Challenge
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

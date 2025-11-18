import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ChallengesPage() {
  const supabase = await createClient()

  // Fetch all active challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Active Challenges</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a challenge, build an MVP, and prove your skills
            </p>
          </div>

          {challenges && challenges.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challenge) => {
                const isParticipating = userParticipations.includes(challenge.id)
                const deliverables = Array.isArray(challenge.deliverables)
                  ? challenge.deliverables
                  : []

                return (
                  <div
                    key={challenge.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold">{challenge.title}</h2>
                      {isParticipating && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm font-semibold">
                          In Progress
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {challenge.description}
                    </p>

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

                    {challenge.deadline && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                      </p>
                    )}

                    <Link
                      href={`/challenges/${challenge.id}`}
                      className="inline-block w-full text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                    >
                      View Challenge
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No active challenges at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

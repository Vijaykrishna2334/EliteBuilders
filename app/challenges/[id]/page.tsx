import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import StartChallengeButton from '@/components/StartChallengeButton'
import SubmitButton from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isParticipating = false
  let hasSubmitted = false
  let submission = null

  if (user) {
    // Check if user is participating
    const { data: participation } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', id)
      .single()

    isParticipating = !!participation

    // Check if user has submitted
    const { data: userSubmission } = await supabase
      .from('submissions')
      .select(`
        *,
        scores (*)
      `)
      .eq('user_id', user.id)
      .eq('challenge_id', id)
      .single()

    hasSubmitted = !!userSubmission
    submission = userSubmission
  }

  const deliverables = Array.isArray(challenge.deliverables)
    ? challenge.deliverables
    : []

  const rubric = typeof challenge.rubric === 'object' && challenge.rubric !== null
    ? challenge.rubric as any
    : {}

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/challenges"
              className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
            >
              ← Back to Challenges
            </Link>
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-bold mb-2">{challenge.title}</h1>
              {isParticipating && (
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full font-semibold">
                  In Progress
                </span>
              )}
            </div>
            {challenge.deadline && (
              <p className="text-gray-600 dark:text-gray-400">
                Deadline: {new Date(challenge.deadline).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>

          {/* Deliverables */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Deliverables</h2>
            <ul className="space-y-3">
              {deliverables.map((item: any, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-3 font-bold">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {typeof item === 'string' ? item : item.name || 'Deliverable'}
                    </p>
                    {typeof item === 'object' && item.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Rubric */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Scoring Rubric</h2>
            {rubric.criteria && Array.isArray(rubric.criteria) ? (
              <div className="space-y-4">
                {rubric.criteria.map((criterion: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {criterion.name}
                      </h3>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {criterion.points} pts
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {criterion.description}
                    </p>
                  </div>
                ))}
                <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                      {rubric.criteria.reduce((sum: number, c: any) => sum + (c.points || 0), 0)} pts
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Your submission will be evaluated automatically by our LLM scoring pipeline.
              </p>
            )}
          </div>

          {/* Submission Status */}
          {hasSubmitted && submission && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Submission</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-semibold capitalize">{submission.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Repository</p>
                  <a
                    href={submission.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {submission.repo_url}
                  </a>
                </div>
                {submission.scores && submission.scores.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {submission.scores[0].total_score} / 100
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            {!user ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Sign in to start this challenge
                </p>
                <Link
                  href="/login"
                  className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Sign In
                </Link>
              </div>
            ) : hasSubmitted ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have already submitted for this challenge
                </p>
                <Link
                  href={`/challenges/${id}/leaderboard`}
                  className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  View Leaderboard
                </Link>
              </div>
            ) : isParticipating ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ready to submit your MVP?
                </p>
                <SubmitButton challengeId={id} />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start this challenge to begin building
                </p>
                <StartChallengeButton challengeId={id} />
              </div>
            )}
          </div>

          {/* Leaderboard Link */}
          <div className="mt-6 text-center">
            <Link
              href={`/challenges/${id}/leaderboard`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Leaderboard →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

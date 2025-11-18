import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import SubmissionForm from '@/components/SubmissionForm'

export const dynamic = 'force-dynamic'

export default async function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch challenge details
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (!challenge) {
    notFound()
  }

  // Check if user is participating
  const { data: participation } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('user_id', user.id)
    .eq('challenge_id', id)
    .single()

  if (!participation) {
    redirect(`/challenges/${id}`)
  }

  // Check if user has already submitted
  const { data: existingSubmission } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', user.id)
    .eq('challenge_id', id)
    .single()

  if (existingSubmission) {
    redirect(`/challenges/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Submit Your MVP</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {challenge.title}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 p-4 mb-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Submission Requirements
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• GitHub repository with working code and README</li>
                  <li>• Presentation deck (PDF) uploaded and publicly accessible</li>
                  <li>• Demo video (YouTube, Loom, or similar) showing your MVP in action</li>
                </ul>
              </div>
            </div>

            <SubmissionForm challengeId={id} userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}

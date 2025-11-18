'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SubmissionForm({
  challengeId,
  userId,
}: {
  challengeId: string
  userId: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    repoUrl: '',
    deckUrl: '',
    videoUrl: '',
  })

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateGitHubUrl = (url: string) => {
    return url.includes('github.com')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.repoUrl || !formData.deckUrl || !formData.videoUrl) {
      setError('All fields are required')
      return
    }

    if (!validateUrl(formData.repoUrl) || !validateGitHubUrl(formData.repoUrl)) {
      setError('Please provide a valid GitHub repository URL')
      return
    }

    if (!validateUrl(formData.deckUrl)) {
      setError('Please provide a valid deck URL')
      return
    }

    if (!validateUrl(formData.videoUrl)) {
      setError('Please provide a valid video URL')
      return
    }

    try {
      setLoading(true)

      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          repo_url: formData.repoUrl,
          deck_url: formData.deckUrl,
          video_url: formData.videoUrl,
          status: 'pending',
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Trigger LLM scoring (we'll create an API route for this)
      await fetch('/api/score-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
        }),
      })

      // Redirect to challenge page
      router.push(`/challenges/${challengeId}?submitted=true`)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="repoUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          GitHub Repository URL *
        </label>
        <input
          type="url"
          id="repoUrl"
          value={formData.repoUrl}
          onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
          placeholder="https://github.com/username/repository"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Your repository should be public and contain a detailed README
        </p>
      </div>

      <div>
        <label htmlFor="deckUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Presentation Deck URL *
        </label>
        <input
          type="url"
          id="deckUrl"
          value={formData.deckUrl}
          onChange={(e) => setFormData({ ...formData, deckUrl: e.target.value })}
          placeholder="https://drive.google.com/file/d/... or similar"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Link to your PDF deck (Google Drive, Dropbox, etc.) - must be publicly accessible
        </p>
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Demo Video URL *
        </label>
        <input
          type="url"
          id="videoUrl"
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          YouTube, Loom, or similar video platform showing your MVP in action
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-600 p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Once submitted, your MVP will be automatically evaluated by our LLM scoring pipeline.
          This typically takes 1-2 minutes. You can only submit once per challenge.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit MVP'}
        </button>
      </div>
    </form>
  )
}

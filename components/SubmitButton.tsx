'use client'

import Link from 'next/link'

export default function SubmitButton({ challengeId }: { challengeId: string }) {
  return (
    <Link
      href={`/challenges/${challengeId}/submit`}
      className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
    >
      Submit MVP
    </Link>
  )
}

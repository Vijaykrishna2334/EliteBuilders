import { createClient } from '@/lib/supabase/server'
import { fetchSubmissionArtifacts } from '@/lib/scoring/fetch-artifacts'
import { scoreSubmission, performSafetyCheck } from '@/lib/scoring/llm-scorer'
import { queueEmail } from '@/lib/email/notifications'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch submission details with user profile
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        challenges (*),
        profiles:user_id (email, full_name)
      `)
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const challenge = submission.challenges as any
    const profile = submission.profiles as any

    // Send submission received email
    if (profile?.email) {
      await queueEmail(
        submission.user_id,
        profile.email,
        `Submission Received - ${challenge.title}`,
        'submission_received',
        {
          userName: profile.full_name || 'Builder',
          challengeTitle: challenge.title,
          repoUrl: submission.repo_url,
          submittedAt: submission.submitted_at,
          challengeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/challenges/${challenge.id}`,
        }
      )
    }

    // Update submission status to 'scoring'
    await supabase
      .from('submissions')
      .update({ status: 'scoring' })
      .eq('id', submissionId)

    // Fetch submission artifacts
    const artifacts = await fetchSubmissionArtifacts(
      submission.repo_url,
      submission.deck_url,
      submission.video_url
    )

    // Perform safety check
    const safetyCheck = await performSafetyCheck(
      artifacts.readme,
      artifacts.deck,
      artifacts.video
    )

    if (!safetyCheck.isSafe) {
      await supabase
        .from('submissions')
        .update({ status: 'failed' })
        .eq('id', submissionId)

      return NextResponse.json(
        {
          error: 'Submission failed safety check',
          reason: safetyCheck.reason,
        },
        { status: 400 }
      )
    }

    // Score the submission
    const scoringResult = await scoreSubmission(
      challenge.title,
      challenge.description,
      challenge.rubric,
      artifacts.readme,
      artifacts.deck,
      artifacts.video
    )

    // Save score to database
    const { error: scoreError } = await supabase.from('scores').insert({
      submission_id: submissionId,
      llm_score: scoringResult.totalScore,
      rubric_scores: scoringResult.rubricScores,
      repo_analysis: scoringResult.repoAnalysis,
      deck_analysis: scoringResult.deckAnalysis,
      video_analysis: scoringResult.videoAnalysis,
      score_type: 'llm',
    })

    if (scoreError) {
      console.error('Error saving score:', scoreError)
      await supabase
        .from('submissions')
        .update({ status: 'failed' })
        .eq('id', submissionId)

      return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
    }

    // Update submission status to 'scored'
    await supabase
      .from('submissions')
      .update({ status: 'scored' })
      .eq('id', submissionId)

    // Send score ready email
    if (profile?.email) {
      await queueEmail(
        submission.user_id,
        profile.email,
        `Your Score is Ready - ${challenge.title}`,
        'score_ready',
        {
          userName: profile.full_name || 'Builder',
          challengeTitle: challenge.title,
          score: scoringResult.totalScore,
          rubricScores: scoringResult.rubricScores,
          leaderboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/challenges/${challenge.id}/leaderboard`,
          profileUrl: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${submission.user_id}`,
        }
      )
    }

    return NextResponse.json({
      success: true,
      score: scoringResult.totalScore,
    })
  } catch (error: any) {
    console.error('Error scoring submission:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { fetchSubmissionArtifacts } from '@/lib/scoring/fetch-artifacts'
import { scoreSubmission, performSafetyCheck } from '@/lib/scoring/llm-scorer'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        challenges (*)
      `)
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
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
      // Mark submission as failed and create a report
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
    const challenge = submission.challenges as any
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
      total_score: scoringResult.totalScore,
      rubric_scores: scoringResult.rubricScores,
      repo_analysis: scoringResult.repoAnalysis,
      deck_analysis: scoringResult.deckAnalysis,
      video_analysis: scoringResult.videoAnalysis,
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

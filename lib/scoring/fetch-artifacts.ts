/**
 * Fetches README content from a GitHub repository
 */
export async function fetchGitHubReadme(repoUrl: string): Promise<string> {
  try {
    // Extract owner and repo from URL
    // Example: https://github.com/owner/repo -> owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }

    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, '')

    // Fetch README via GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/readme`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch README: ${response.statusText}`)
    }

    const readme = await response.text()
    return readme
  } catch (error: any) {
    console.error('Error fetching GitHub README:', error)
    return `Error fetching README: ${error.message}`
  }
}

/**
 * Extracts text content from a PDF URL (simplified - just returns the URL for now)
 * In production, you'd use a PDF parsing service or library
 */
export async function fetchDeckContent(deckUrl: string): Promise<string> {
  // For v1, we'll just return the URL and ask the LLM to acknowledge it
  // In production, you'd want to:
  // 1. Download the PDF
  // 2. Extract text using a library like pdf-parse
  // 3. Or use a service like Azure Document Intelligence
  return `Deck URL: ${deckUrl}\nNote: Full deck parsing not implemented in v1. LLM should evaluate based on URL accessibility.`
}

/**
 * Extracts transcript from a video URL
 * For v1, returns the URL. In production, you'd use YouTube API or transcription services
 */
export async function fetchVideoTranscript(videoUrl: string): Promise<string> {
  // For v1, we'll just return the URL
  // In production, you'd want to:
  // 1. Use YouTube Data API for YouTube videos
  // 2. Use Loom API for Loom videos
  // 3. Or use a transcription service like Deepgram/AssemblyAI
  return `Video URL: ${videoUrl}\nNote: Full video transcription not implemented in v1. LLM should evaluate based on URL accessibility.`
}

/**
 * Fetches all artifacts for a submission
 */
export async function fetchSubmissionArtifacts(
  repoUrl: string,
  deckUrl: string,
  videoUrl: string
) {
  const [readme, deck, video] = await Promise.all([
    fetchGitHubReadme(repoUrl),
    fetchDeckContent(deckUrl),
    fetchVideoTranscript(videoUrl),
  ])

  return {
    readme,
    deck,
    video,
  }
}

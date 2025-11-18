import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const challenges = [
  {
    title: 'AI-Powered Code Review Assistant',
    description: `Build an intelligent code review assistant that uses LLMs to analyze pull requests and provide actionable feedback.

Your MVP should:
- Accept a GitHub PR URL or code diff as input
- Analyze code quality, potential bugs, security issues, and best practices
- Generate structured, actionable review comments
- Provide a summary with severity levels (critical, medium, minor)

Focus on making the feedback practical and developer-friendly. Consider edge cases like large PRs and multiple programming languages.`,
    deliverables: [
      { name: 'Working application with a simple UI', description: 'Can be web-based or CLI' },
      { name: 'GitHub repository with clear README', description: 'Setup instructions and examples' },
      { name: 'Presentation deck', description: 'Problem, solution, architecture, and demo screenshots' },
      { name: 'Demo video (3-5 min)', description: 'Show the tool analyzing a real PR' },
    ],
    rubric: {
      criteria: [
        {
          name: 'Functionality & Completeness',
          description: 'Does the tool work as described? Can it analyze code and provide meaningful feedback?',
          points: 30,
        },
        {
          name: 'Code Quality & Architecture',
          description: 'Is the code well-structured, documented, and maintainable?',
          points: 25,
        },
        {
          name: 'Innovation & Usefulness',
          description: 'Does it solve a real problem in a creative way? Would developers actually use this?',
          points: 20,
        },
        {
          name: 'Documentation & Presentation',
          description: 'Is the README clear? Is the deck well-designed? Is the demo compelling?',
          points: 15,
        },
        {
          name: 'LLM Integration Quality',
          description: 'Is the LLM prompt engineering effective? Are results consistent and accurate?',
          points: 10,
        },
      ],
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: 'active',
  },
  {
    title: 'Smart Meeting Summarizer',
    description: `Create an AI tool that automatically summarizes meeting recordings or transcripts into actionable insights.

Your MVP should:
- Accept meeting recordings (audio/video) or transcripts as input
- Generate structured summaries with key discussion points
- Extract action items with owners (if mentioned)
- Identify decisions made and topics discussed
- Support multiple participants

Consider edge cases like long meetings, poor audio quality, and multiple languages (optional).`,
    deliverables: [
      { name: 'Functional web application or API', description: 'Upload and process meetings' },
      { name: 'GitHub repository with documentation', description: 'Clear setup and usage instructions' },
      { name: 'Presentation deck', description: 'Problem statement, solution approach, and use cases' },
      { name: 'Demo video (3-5 min)', description: 'Process a real meeting and show results' },
    ],
    rubric: {
      criteria: [
        {
          name: 'Core Functionality',
          description: 'Can it accurately summarize meetings and extract action items?',
          points: 35,
        },
        {
          name: 'User Experience',
          description: 'Is it easy to use? Is the output format useful and clear?',
          points: 20,
        },
        {
          name: 'Technical Implementation',
          description: 'Quality of code, architecture, and LLM integration',
          points: 25,
        },
        {
          name: 'Documentation & Demo',
          description: 'README quality, deck design, and video clarity',
          points: 15,
        },
        {
          name: 'Innovation',
          description: 'Any unique features or approaches that set it apart?',
          points: 5,
        },
      ],
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    title: 'Intelligent Document Q&A System',
    description: `Build a document-based question-answering system that lets users upload documents and ask questions about their content.

Your MVP should:
- Support common document formats (PDF, TXT, Markdown, DOCX)
- Use RAG (Retrieval-Augmented Generation) or similar techniques
- Provide accurate answers with source citations
- Handle multi-document queries
- Display relevant passages from the source documents

Focus on accuracy and source attribution. Consider document chunking strategies and retrieval quality.`,
    deliverables: [
      { name: 'Working web application', description: 'Upload docs and ask questions' },
      { name: 'GitHub repository', description: 'Well-documented code with setup instructions' },
      { name: 'Presentation deck', description: 'Technical approach, architecture, and demo' },
      { name: 'Demo video (3-5 min)', description: 'Show the system answering questions from real documents' },
    ],
    rubric: {
      criteria: [
        {
          name: 'Accuracy & Relevance',
          description: 'Does it provide accurate answers with proper source citations?',
          points: 30,
        },
        {
          name: 'Technical Implementation',
          description: 'Quality of RAG implementation, chunking strategy, and retrieval',
          points: 25,
        },
        {
          name: 'User Interface & Experience',
          description: 'Is it intuitive to use? Is the answer presentation clear?',
          points: 20,
        },
        {
          name: 'Document Processing',
          description: 'Can it handle various formats and large documents efficiently?',
          points: 15,
        },
        {
          name: 'Documentation & Demo',
          description: 'README clarity, deck quality, and demo effectiveness',
          points: 10,
        },
      ],
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    title: 'AI Email Assistant',
    description: `Create an email assistant that helps users draft, summarize, and manage their emails using AI.

Your MVP should include at least 2 of these features:
- Smart email drafting with tone control (professional, casual, formal)
- Email summarization for long threads
- Automated categorization (urgent, can wait, FYI, etc.)
- Smart reply suggestions
- Meeting scheduler from email context

Focus on practical features that save time and improve email productivity.`,
    deliverables: [
      { name: 'Working application (web or browser extension)', description: 'Functional MVP with chosen features' },
      { name: 'GitHub repository', description: 'Source code with clear documentation' },
      { name: 'Presentation deck', description: 'Features, architecture, and use cases' },
      { name: 'Demo video (3-5 min)', description: 'Demonstrate key features in action' },
    ],
    rubric: {
      criteria: [
        {
          name: 'Feature Completeness',
          description: 'Do the implemented features work well and provide value?',
          points: 30,
        },
        {
          name: 'LLM Quality',
          description: 'Are the AI-generated outputs high quality and appropriate?',
          points: 25,
        },
        {
          name: 'User Experience',
          description: 'Is it easy to use? Does it integrate smoothly into workflows?',
          points: 20,
        },
        {
          name: 'Code Quality',
          description: 'Well-structured, maintainable code with good practices',
          points: 15,
        },
        {
          name: 'Presentation',
          description: 'Clear documentation, compelling deck, and effective demo',
          points: 10,
        },
      ],
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    title: 'Content Moderation Dashboard',
    description: `Build an AI-powered content moderation tool that helps platforms detect and manage inappropriate content.

Your MVP should:
- Analyze text, images, or both for inappropriate content
- Categorize violations (hate speech, spam, NSFW, violence, etc.)
- Provide confidence scores and explanations
- Offer a simple dashboard to review flagged content
- Support bulk processing

Consider accuracy, false positive rates, and explainability. Make decisions transparent.`,
    deliverables: [
      { name: 'Functional web dashboard', description: 'Upload content and see moderation results' },
      { name: 'GitHub repository', description: 'Code with setup instructions and examples' },
      { name: 'Presentation deck', description: 'Problem, solution, and moderation approach' },
      { name: 'Demo video (3-5 min)', description: 'Show the tool moderating various content types' },
    ],
    rubric: {
      criteria: [
        {
          name: 'Accuracy & Reliability',
          description: 'Does it correctly identify violations with reasonable accuracy?',
          points: 35,
        },
        {
          name: 'Explainability',
          description: 'Are moderation decisions clear and well-explained?',
          points: 20,
        },
        {
          name: 'Dashboard & UX',
          description: 'Is the interface intuitive and useful for moderators?',
          points: 20,
        },
        {
          name: 'Technical Quality',
          description: 'Code quality, architecture, and LLM integration',
          points: 15,
        },
        {
          name: 'Documentation',
          description: 'README, deck, and demo quality',
          points: 10,
        },
      ],
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    title: 'AI Learning Assistant',
    description: `Create an adaptive learning assistant that helps users learn new topics through AI-generated content and quizzes.

Your MVP should:
- Accept a topic or learning goal from the user
- Generate a personalized learning path with explanations
- Create interactive quizzes to test understanding
- Adapt difficulty based on user performance
- Track progress and suggest next steps

Focus on making learning engaging and effective. Consider different learning styles.`,
    deliverables: [
      { name: 'Interactive web application', description: 'Users can learn and track progress' },
      { name: 'GitHub repository', description: 'Source code with setup guide' },
      { name: 'Presentation deck', description: 'Learning approach, features, and pedagogy' },
      { name: 'Demo video (3-5 min)', description: 'Show a complete learning journey' },
    ],
    rubric: {
      criteria: [
        {
          name: 'Learning Effectiveness',
          description: 'Does it help users actually learn? Is content accurate and clear?',
          points: 30,
        },
        {
          name: 'Adaptivity & Personalization',
          description: 'Does it adapt to user performance and learning pace?',
          points: 25,
        },
        {
          name: 'User Engagement',
          description: 'Is the learning experience engaging and motivating?',
          points: 20,
        },
        {
          name: 'Technical Implementation',
          description: 'Code quality, LLM integration, and architecture',
          points: 15,
        },
        {
          name: 'Documentation & Demo',
          description: 'README clarity, deck quality, and video effectiveness',
          points: 10,
        },
      ],
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    title: 'SQL Query Generator from Natural Language',
    description: `Build a tool that converts natural language questions into SQL queries and executes them against a database.

Your MVP should:
- Accept natural language questions about data
- Generate accurate SQL queries (SELECT, JOIN, WHERE, GROUP BY, etc.)
- Execute queries safely against a demo database
- Display results in a user-friendly format
- Handle complex multi-table queries
- Provide query explanations

Include a sample database schema (e.g., e-commerce, analytics, or HR data). Focus on query accuracy and safety.`,
    deliverables: [
      { name: 'Working web application', description: 'Query interface with sample database' },
      { name: 'GitHub repository', description: 'Code with setup instructions and sample data' },
      { name: 'Presentation deck', description: 'Approach, architecture, and supported query types' },
      { name: 'Demo video (3-5 min)', description: 'Demonstrate various query types and edge cases' },
    ],
    rubric: {
      criteria: [
        {
          name: 'Query Accuracy',
          description: 'Does it generate correct SQL for various natural language inputs?',
          points: 35,
        },
        {
          name: 'Safety & Validation',
          description: 'Does it prevent SQL injection and dangerous operations?',
          points: 20,
        },
        {
          name: 'User Experience',
          description: 'Is it easy to use? Are results displayed clearly?',
          points: 20,
        },
        {
          name: 'Technical Quality',
          description: 'Code structure, LLM prompting, and error handling',
          points: 15,
        },
        {
          name: 'Documentation',
          description: 'README, deck, and demo effectiveness',
          points: 10,
        },
      ],
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
]

async function seedChallenges() {
  console.log('Seeding challenges...')

  for (const challenge of challenges) {
    const { data, error } = await supabase
      .from('challenges')
      .insert(challenge)
      .select()

    if (error) {
      console.error(`Error inserting challenge "${challenge.title}":`, error)
    } else {
      console.log(`✓ Inserted: ${challenge.title}`)
    }
  }

  console.log('Done!')
}

seedChallenges()

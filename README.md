<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=160&section=header&text=EliteBuilders&fontSize=40&fontColor=fff&animation=twinkling&fontAlignY=36&desc=AI-Powered%20Developer%20Challenge%20Platform&descAlignY=58&descSize=16" width="100%"/>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

# liteBuilders

**Prove Your AI Skills Through Real MVPs**

liteBuilders is a builder-first competitive platform where individuals rapidly create and submit AI-powered MVPs for real challenges. Submissions are automatically evaluated by an LLM scoring pipeline, ranked on challenge leaderboards, and added to a shareable builder portfolio.

## Features

- **Real Challenges**: Browse and participate in AI-focused building challenges
- **OAuth Authentication**: Sign in with Google or GitHub
- **Automated LLM Evaluation**: Submissions are scored automatically using GPT-4
- **Challenge Leaderboards**: Compete with other builders and see rankings
- **Builder Portfolios**: Showcase your submissions and scores
- **Links-Only Submissions**: No file storage - submit GitHub repo, deck, and video links

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google/GitHub OAuth)
- **LLM**: OpenAI GPT-4 / Anthropic Claude
- **Hosting**: Vercel (recommended)

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── score-submission/     # LLM scoring endpoint
│   ├── challenges/               # Challenge pages
│   │   └── [id]/                 # Individual challenge
│   │       ├── leaderboard/      # Challenge leaderboard
│   │       └── submit/           # Submission form
│   ├── dashboard/                # User dashboard
│   ├── login/                    # Authentication
│   ├── profile/[id]/             # User profile/portfolio
│   └── page.tsx                  # Landing page
├── components/                   # React components
├── lib/                          # Utilities
│   ├── scoring/                  # LLM scoring logic
│   └── supabase/                 # Supabase clients
├── scripts/                      # Database seeds
├── supabase/                     # Database schema
│   └── migrations/               # SQL migrations
└── types/                        # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key or Anthropic API key
- Google/GitHub OAuth credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Vijaykrishna2334/EliteBuilders.git
cd EliteBuilders
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```bash
   # Copy content from supabase/migrations/001_initial_schema.sql
   # Paste and execute in Supabase SQL Editor
   ```
3. Configure **Authentication Providers**:
   - Go to **Authentication > Providers**
   - Enable **Google** and **GitHub**
   - Add OAuth credentials (see below)

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `https://<your-project>.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# LLM API Keys (at least one required)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your Supabase credentials from **Project Settings > API**.

### 4. Seed Initial Challenges

```bash
npm run seed
```

This will populate your database with 7 initial AI challenges.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 6. Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.local`
4. Deploy!

Vercel will automatically detect Next.js and configure build settings.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Ensure you set all environment variables and use Node.js 18+.

## Usage

### As a Builder

1. **Sign In**: Use Google or GitHub OAuth
2. **Browse Challenges**: View active challenges at `/challenges`
3. **Start a Challenge**: Click "Start Challenge" to begin
4. **Build Your MVP**: Create your solution
5. **Submit**: Provide GitHub repo, deck PDF, and demo video links
6. **Get Scored**: Automatic LLM evaluation (1-2 minutes)
7. **View Results**: Check leaderboard and your profile

### As an Admin (Seeding Challenges)

Create new challenges by inserting into the `challenges` table:

```sql
INSERT INTO challenges (title, description, deliverables, rubric, deadline, status)
VALUES (
  'Your Challenge Title',
  'Detailed description...',
  '[{"name": "Deliverable 1", "description": "Details"}]'::jsonb,
  '{"criteria": [{"name": "Criterion", "description": "...", "points": 30}]}'::jsonb,
  '2025-12-31T23:59:59Z',
  'active'
);
```

Or modify `scripts/seed-challenges.ts` and run `npm run seed`.

## How LLM Scoring Works

1. **Artifact Fetching**: System fetches README from GitHub, deck URL, and video URL
2. **Safety Check**: LLM performs content moderation to detect harmful content
3. **Scoring**: GPT-4 evaluates submission based on challenge rubric
4. **Storage**: Score and detailed analysis are saved to database
5. **Leaderboard**: Submissions ranked by total score (ties broken by submission time)

### Scoring Criteria (Typical)

- **Functionality & Completeness** (30-35 points)
- **Code Quality & Architecture** (20-25 points)
- **Innovation & Creativity** (15-20 points)
- **Documentation & Presentation** (10-15 points)
- **LLM Integration Quality** (5-10 points)

## API Routes

### `POST /api/score-submission`

Triggers LLM scoring for a submission.

**Request:**
```json
{
  "submissionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "score": 85
}
```

## Database Schema

Key tables:
- `profiles` - User profiles (extends Supabase auth.users)
- `challenges` - Challenge definitions
- `challenge_participants` - Tracks who started which challenge
- `submissions` - MVP submissions (repo, deck, video links)
- `scores` - LLM evaluation results
- `leaderboard` - View for rankings

See `supabase/migrations/001_initial_schema.sql` for full schema.

## Development Notes

### Adding New Challenges

1. Edit `scripts/seed-challenges.ts`
2. Add your challenge object
3. Run `npm run seed`

### Modifying Scoring Logic

Edit `lib/scoring/llm-scorer.ts` to adjust:
- Prompt engineering
- Rubric interpretation
- Safety checks
- LLM model selection

### Customizing UI

- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Components: `components/`

## Troubleshooting

### Build Errors

**Issue**: Tailwind CSS errors
- Ensure you have `@tailwindcss/postcss` installed
- Check `postcss.config.mjs` uses `@tailwindcss/postcss`

**Issue**: Supabase connection errors
- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure RLS policies are properly configured

### Authentication Issues

- Verify OAuth redirect URLs match exactly
- Check that providers are enabled in Supabase dashboard
- Ensure `middleware.ts` is properly configured

### LLM Scoring Failures

- Check API keys are valid and have credits
- Review `app/api/score-submission/route.ts` logs
- Verify README is accessible from GitHub repo
- Ensure submission status updates correctly

## Contributing

This is an MVP platform. Contributions are welcome!

Areas for improvement:
- Email notifications for submission scoring
- Advanced moderation tools
- Company-side talent discovery features
- Better PDF/video parsing
- Submission editing/resubmission
- Challenge categories and search
- Builder badges and achievements

## License

ISC

## Support

For issues or questions:
- Check the [Supabase setup guide](supabase/README.md)
- Review environment variable configuration
- Ensure all dependencies are installed

---

## 📬 Contact

**Built by [Vijay Krishna](https://github.com/Vijaykrishna2334)**
- 📧 vijaykrishna2334@gmail.com
- 💼 [LinkedIn](https://linkedin.com/in/vijaykrishna2334)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=80&section=footer" width="100%"/>

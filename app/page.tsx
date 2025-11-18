import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Get stats
  const { count: totalChallenges } = await supabase
    .from('challenges')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: totalSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })

  const { count: totalBuilders } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              🚀 The Future of AI Talent Discovery
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Prove Your AI Skills<br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Through Real MVPs
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-blue-50 max-w-3xl mx-auto leading-relaxed">
              Build and ship AI-powered MVPs for real challenges. Get evaluated by LLM scoring,
              compete on leaderboards, and showcase your portfolio to top companies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/challenges"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
              >
                Browse Challenges
              </Link>
              <Link
                href="/leaderboard"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white" className="dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {totalChallenges || 0}+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">Active Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {totalSubmissions || 0}+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">MVPs Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                {totalBuilders || 0}+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">Builders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">liteBuilders</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The only platform that proves your AI skills through real-world MVPs, not toy problems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🚀
              </div>
              <h3 className="text-2xl font-bold mb-4">Build Real MVPs</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Take on company-sponsored challenges and ship production-ready AI prototypes.
                Not algorithms—actual products.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-2xl font-bold mb-4">LLM Evaluation</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Get instant, objective scoring powered by GPT-4. Your code, documentation,
                and demo are evaluated against structured rubrics.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🏆
              </div>
              <h3 className="text-2xl font-bold mb-4">Earn Recognition</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Climb leaderboards, earn badges, and build a portfolio that actually impresses
                hiring managers and proves your skills.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                💼
              </div>
              <h3 className="text-2xl font-bold mb-4">Get Discovered</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Companies browse top performers and sponsor challenges. Your profile is a
                living resume that showcases real AI expertise.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                💰
              </div>
              <h3 className="text-2xl font-bold mb-4">Win Prizes</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Compete for cash prizes from sponsors. Top performers earn rewards while
                building their reputation and portfolio.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                📈
              </div>
              <h3 className="text-2xl font-bold mb-4">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Career leaderboard tracks your growth across seasons. Build a long-term
                reputation as a top AI builder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Simple. Fast. Fair.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Choose a Challenge</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Browse our catalogue of company-sponsored AI challenges. Filter by category,
                  prize amount, or difficulty. Read the requirements and rubric.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Build Your MVP</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Code your solution, write great documentation, and record a demo video.
                  You have complete creative freedom—just meet the requirements.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Submit & Get Scored</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Submit your GitHub repo, deck, and demo video. Our LLM pipeline evaluates your
                  submission in 1-2 minutes. Receive instant, detailed feedback.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Compete & Win</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Climb the leaderboard, earn badges, and win prizes. Share your profile with
                  employers and get discovered by top companies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Prove Your AI Skills?
          </h2>
          <p className="text-xl mb-8 text-blue-50 max-w-2xl mx-auto">
            Join hundreds of builders shipping real AI products and getting discovered by top companies
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-5 bg-white text-blue-600 rounded-xl text-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
          >
            Start Building Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">liteBuilders</h3>
              <p className="text-sm">
                The future of AI talent discovery. Build MVPs, not algorithms.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/challenges" className="hover:text-white transition-colors">Challenges</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link href="/sponsor" className="hover:text-white transition-colors">For Companies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Code of Conduct</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2025 liteBuilders. Built with ❤️ for the AI builder community.
          </div>
        </div>
      </footer>
    </div>
  )
}

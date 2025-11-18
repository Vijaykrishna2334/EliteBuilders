import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            liteBuilders
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Prove Your AI Skills Through Real MVPs
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Build and ship AI-powered MVPs for real challenges. Get evaluated by our LLM scoring pipeline,
            compete on leaderboards, and showcase your portfolio to employers.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Build Real MVPs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take on real-world challenges and ship working prototypes
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">LLM Evaluation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant, objective scoring on your repo, deck, and demo
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Showcase Skills</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build a portfolio that proves your applied-AI ability
              </p>
            </div>
          </div>

          <div className="mt-16">
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

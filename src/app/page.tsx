import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Wallet,
  Shield,
  TrendingUp,
  Target,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-darker">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl honey-gradient flex items-center justify-center shadow-honey">
              <span className="text-lg">🐝</span>
            </div>
            <span className="text-xl font-extrabold text-hive-800">
              Budget<span className="text-honey-500">Bee</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-hive-600 hover:text-hive-800 transition-honey"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold bg-honey-500 text-hive-800 rounded-xl hover:bg-honey-400 transition-honey shadow-honey"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden honeycomb-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36">
          <div className="text-center max-w-3xl mx-auto">
            {/* Floating bee */}
            <div className="text-6xl sm:text-7xl mb-6 animate-float">🐝</div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-hive-800 leading-tight mb-6">
              <span className="text-honey-500">Budget</span>Bee
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-hive-600 mb-4">
              Bee Smart with Your Money.
            </p>

            <p className="text-base sm:text-lg text-hive-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Track your expenses, build better habits, and watch your savings
              grow—one small step at a time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold bg-honey-500 text-hive-800 rounded-2xl hover:bg-honey-400 transition-honey shadow-honey hover:shadow-lg"
              >
                Start Buzzing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-hive-600 border-2 border-cream-darker rounded-2xl hover:border-honey-300 hover:bg-honey-50 transition-honey"
              >
                I Already Have an Account
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative hexagons */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-honey-200/30 hex-shape hidden lg:block animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-40 right-16 w-12 h-12 bg-honey-300/20 hex-shape hidden lg:block animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-honey-100/40 hex-shape hidden lg:block animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-honey-200/25 hex-shape hidden lg:block animate-float" style={{ animationDelay: "2s" }} />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-hive-800 mb-4">
              Everything You Need to{" "}
              <span className="text-honey-500">Manage Money</span>
            </h2>
            <p className="text-hive-400 max-w-xl mx-auto">
              Simple yet powerful tools to help you take control of your
              finances. No complexity, just clarity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Expense Tracking",
                description:
                  "Log every transaction with categories, dates, and notes. See exactly where your money goes.",
                color: "bg-orange-50 text-cat-food",
              },
              {
                icon: Wallet,
                title: "Budget Limits",
                description:
                  "Set monthly budgets per category and get visual alerts when you're approaching your limits.",
                color: "bg-purple-50 text-cat-bills",
              },
              {
                icon: PiggyBank,
                title: "Savings Goals",
                description:
                  "Create multiple savings goals, track deposits, and watch your honey pot grow! 🍯",
                color: "bg-emerald-50 text-cat-entertainment",
              },
              {
                icon: TrendingUp,
                title: "Visual Insights",
                description:
                  "Beautiful charts showing spending trends and category breakdowns at a glance.",
                color: "bg-blue-50 text-cat-transport",
              },
              {
                icon: Target,
                title: "Category Management",
                description:
                  "Customize categories with colors and icons to match your lifestyle and spending habits.",
                color: "bg-pink-50 text-cat-shopping",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description:
                  "Your financial data stays safe with encrypted authentication and secure data handling.",
                color: "bg-amber-50 text-honey-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white border border-cream-darker rounded-3xl hover:shadow-card-hover hover:-translate-y-1 transition-honey"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-hive-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-hive-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 honeycomb-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-6">🍯</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-hive-800 mb-4">
            Ready to Start Building Your{" "}
            <span className="text-honey-500">Honey Pot</span>?
          </h2>
          <p className="text-hive-400 mb-8 max-w-md mx-auto">
            Join BudgetBee today and take the first step toward smarter money
            habits. It&apos;s free!
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-10 py-4 text-lg font-bold bg-honey-500 text-hive-800 rounded-2xl hover:bg-honey-400 transition-honey shadow-honey hover:shadow-lg"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-hive-800 text-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐝</span>
            <span className="text-sm font-bold">
              Budget<span className="text-honey-400">Bee</span>
            </span>
          </div>
          <p className="text-xs text-hive-300">
            © {new Date().getFullYear()} BudgetBee. Made with 🍯 for your
            financial wellbeing.
          </p>
        </div>
      </footer>
    </div>
  );
}

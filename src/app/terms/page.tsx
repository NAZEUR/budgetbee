export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-8 py-20 font-sans">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
      <p className="mb-4">By accessing and using BudgetBee, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
      <p className="mb-4">BudgetBee provides personal financial management tools including budget tracking, AI-assisted categorization, and expense logging.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Responsibilities</h2>
      <p className="mb-4">You are responsible for maintaining the security of your account and the confidentiality of your authentication credentials. BudgetBee is an informational tool and does not provide professional financial advice.</p>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-8 py-20 font-sans">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
      <p className="mb-4">BudgetBee collects minimal information required to provide our financial tracking services. When you connect your Gmail account, we only request read-only access to specific emails (receipts/invoices) to automatically log your expenses.</p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Data</h2>
      <p className="mb-4">The data collected is strictly used to display your financial dashboard and provide AI-driven insights. We do not sell, rent, or share your personal data or email contents with any third parties.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
      <p className="mb-4">We use industry-standard security measures to protect your data. Your connection tokens are securely stored and you can revoke access at any time from your settings or directly from your Google Account.</p>
    </div>
  );
}

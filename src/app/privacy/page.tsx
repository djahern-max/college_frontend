import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl opacity-90">How we protect and use your information</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="prose prose-lg max-w-none text-gray-300">
          <div className="bg-gray-800 rounded-lg p-8 space-y-8">
            
            <div>
              <p className="text-sm text-gray-400 mb-6">
                <strong>Effective Date:</strong> August 24, 2025<br/>
                <strong>Last Updated:</strong> August 24, 2025
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to MagicScholar ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website magicscholar.com and use our scholarship matching services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Personal Information</h3>
              <p className="mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Register for an account</li>
                <li>Complete your profile</li>
                <li>Apply for scholarships through our platform</li>
                <li>Contact our support team</li>
                <li>Sign up for newsletters or communications</li>
              </ul>

              <p className="mb-4">This information may include:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>Name and contact information (email, phone, address)</li>
                <li>Educational information (school, GPA, major, graduation year)</li>
                <li>Demographic information (age, gender, ethnicity)</li>
                <li>Financial information (income, financial need)</li>
                <li>Academic achievements and extracurricular activities</li>
                <li>Essay responses and personal statements</li>
              </ul>

              <h3 className="text-xl font-semibold text-blue-400 mb-3">OAuth and Social Media Information</h3>
              <p className="mb-4">When you connect your account through OAuth providers (Google, LinkedIn, TikTok), we may collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Basic profile information (name, email, profile picture)</li>
                <li>Educational and professional background (from LinkedIn)</li>
                <li>Information you've made publicly available on these platforms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong className="text-blue-400">Provide Services:</strong> Match you with relevant scholarship opportunities</li>
                <li><strong className="text-blue-400">Account Management:</strong> Create and manage your user account</li>
                <li><strong className="text-blue-400">Communication:</strong> Send scholarship alerts, updates, and platform notifications</li>
                <li><strong className="text-blue-400">Personalization:</strong> Customize your experience and improve our matching algorithms</li>
                <li><strong className="text-blue-400">Analytics:</strong> Understand how our platform is used and improve our services</li>
                <li><strong className="text-blue-400">Legal Compliance:</strong> Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Scholarship Providers</h3>
              <p className="mb-4">We may share your information with scholarship providers and educational institutions to facilitate applications and matching.</p>

              <h3 className="text-xl font-semibold text-blue-400 mb-3">Service Providers</h3>
              <p className="mb-4">We work with third-party service providers who help us operate our platform, including cloud hosting, email services, and analytics tools.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights and Choices</h2>
              <p className="mb-4">You can:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Access, update, or delete your account information</li>
                <li>Control communication preferences</li>
                <li>Request copies of your personal information</li>
                <li>Object to certain processing of your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Contact Information</h2>
              <p className="mb-4">If you have questions about this Privacy Policy, please contact us:</p>
              <div className="bg-gray-700 rounded-lg p-4">
                <p><strong className="text-blue-400">MagicScholar Privacy Team</strong></p>
                <p>Email: privacy@magicscholar.com</p>
                <p>Website: https://magicscholar.com/contact</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

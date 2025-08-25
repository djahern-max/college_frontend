import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl opacity-90">Your agreement with MagicScholar</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                Welcome to MagicScholar! These Terms of Service ("Terms") govern your use of the MagicScholar website, mobile applications, and related services (collectively, the "Service") operated by MagicScholar ("we," "us," or "our").
              </p>
              <p className="mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">MagicScholar is a scholarship matching platform that helps students:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Discover scholarship opportunities from universities and organizations</li>
                <li>Create profiles to match with relevant scholarships</li>
                <li>Apply for scholarships through our platform</li>
                <li>Access educational resources and guidance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Registration</h3>
              <p className="mb-4">To use certain features of our Service, you must register for an account by providing accurate and complete information.</p>

              <h3 className="text-xl font-semibold text-blue-400 mb-3">Account Security</h3>
              <p className="mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring your account information remains current and accurate</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct and Responsibilities</h2>
              
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Acceptable Use</h3>
              <p className="mb-4">You agree to use our Service only for lawful purposes. You will not:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>

              <h3 className="text-xl font-semibold text-blue-400 mb-3">Profile Information</h3>
              <p className="mb-4">You are responsible for providing accurate and truthful information in your profile and scholarship applications.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Scholarship Applications</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>MagicScholar facilitates connections between students and scholarship providers</li>
                <li>We do not guarantee scholarship awards or funding</li>
                <li>Final scholarship decisions are made by the scholarship providers</li>
                <li>You must comply with all requirements set by individual scholarship providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimers and Limitations</h2>
              
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Notice</h3>
                <p className="text-sm">
                  We do not guarantee scholarship awards or funding amounts. Scholarship decisions are made solely by providers. 
                  We strive to provide accurate information but scholarship details may change without notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Privacy</h2>
              <p className="mb-4">
                Your privacy is important to us. Our <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a> explains 
                how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
              <p className="mb-4">
                We may modify these Terms at any time. We will provide notice of material changes by posting updated Terms on our website 
                and sending email notifications to registered users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
              <p className="mb-4">If you have questions about these Terms, please contact us:</p>
              <div className="bg-gray-700 rounded-lg p-4">
                <p><strong className="text-blue-400">MagicScholar Legal Team</strong></p>
                <p>Email: legal@magicscholar.com</p>
                <p>Website: https://magicscholar.com/contact</p>
              </div>
            </section>

            <div className="border-t border-gray-600 pt-6">
              <p className="text-sm text-gray-400 italic">
                By using MagicScholar, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

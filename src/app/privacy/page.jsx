import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How DavinciWaleBhaiya collects, uses, and protects your personal information and transaction data.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      badge="Privacy & Security"
      title="Privacy Policy"
      lastUpdated="October 1, 2026"
      description="DavinciWaleBhaiya is committed to protecting your personal information and respecting your privacy. This policy outlines how your data is handled when using our website and services."
    >
      {/* 1. Introduction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          1. Introduction
        </h2>
        <p>
          At <strong className="text-white">DavinciWaleBhaiya</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), we take your privacy seriously. This Privacy Policy explains what personal information we collect when you visit <strong className="text-white">davinciwalebhaiya.com</strong>, register an account, download free assets, or purchase digital editing tools and presets, and how we handle, store, and safeguard that information.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          2. Information We Collect
        </h2>
        <p>We collect only the minimum necessary information required to provide, fulfill, and support our digital products:</p>
        
        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-blue-400">
              A. Account & Authentication Information
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              When you sign up or log in, we collect your name and email address. Authentication is handled securely through Supabase Auth. We do not store plain-text passwords.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-blue-400">
              B. Purchase & Order Information
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              When you make a purchase, we record your order reference ID, the specific digital assets purchased, the transaction amount, currency (e.g., INR), timestamp, and payment status returned by the payment gateway.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-blue-400">
              C. Download & Access Records
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              To enforce single-user licensing terms and prevent automated link abuse, we log timestamps of file download attempts and IP-based rate metrics for digital file generation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-blue-400">
              D. Communications & Inquiries
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              If you contact us via our studio or support forms, we store your submitted name, email address, message contents, and project brief details in order to respond to your request.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Payment Processing & Banking Security */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          3. Payment Processing & Critical Notice
        </h2>
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 space-y-2">
          <p className="font-semibold text-emerald-300">Important Security Notice:</p>
          <p>
            <strong className="text-white">DavinciWaleBhaiya does NOT collect, store, or have access to your debit or credit card numbers, CVV codes, expiry dates, net banking passwords, or UPI PINs.</strong>
          </p>
          <p className="text-slate-300">
            All financial transactions are conducted directly through PCI-DSS compliant payment gateways, notably <strong className="text-white">Razorpay</strong>. During checkout, your payment data is encrypted and transmitted directly to Razorpay and your banking institution.
          </p>
        </div>
      </section>

      {/* 4. How We Use Your Information */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          4. How We Use Your Information
        </h2>
        <p>We use your data solely for the following legitimate business purposes:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300">
          <li>To create and maintain your user account.</li>
          <li>To generate secure, time-limited digital download links in your account library.</li>
          <li>To email you transactional receipts, order confirmations, and license keys.</li>
          <li>To notify you about critical bug fixes or major version compatibility updates for tools you own.</li>
          <li>To prevent fraud, multiple unauthorized logins, and intellectual property theft.</li>
          <li>To respond to your support tickets and studio service requests.</li>
        </ul>
      </section>

      {/* 5. Third-Party Infrastructure */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          5. Third-Party Infrastructure Providers
        </h2>
        <p>
          To maintain high reliability and performance, we utilize industry-standard cloud infrastructure partners:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-300">
          <li>
            <strong className="text-white">Supabase:</strong> Provides secure relational database storage and JWT-based user authentication.
          </li>
          <li>
            <strong className="text-white">Razorpay:</strong> Handles secure checkout, UPI, and debit/credit card payment processing under strict PCI-DSS Level 1 compliance.
          </li>
          <li>
            <strong className="text-white">Cloudflare R2:</strong> Provides encrypted object storage and CDN-accelerated signed delivery of downloadable ZIP archives.
          </li>
          <li>
            <strong className="text-white">Resend:</strong> Handles transactional email delivery for order confirmations and download access links.
          </li>
        </ul>
        <p className="text-xs text-slate-400">
          We never sell, rent, or trade your personal information with third-party advertisers or data brokers.
        </p>
      </section>

      {/* 6. Cookies & Local Storage */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          6. Cookies & Local Storage
        </h2>
        <p>
          We use strictly essential session cookies and local storage tokens necessary to keep you securely logged into your account, remember your checkout state, and maintain session integrity. We do not use third-party behavioral tracking cookies or invasive advertising pixels.
        </p>
      </section>

      {/* 7. Data Retention */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          7. Data Retention
        </h2>
        <p>
          We retain your account profile and purchase history for as long as your account remains active so that you can perpetually access your purchased digital downloads in your library. If you wish to delete your account and associated transaction history (subject to statutory accounting and tax retention regulations), you may submit a request to <a href="mailto:support@davinciwalebhaiya.com" className="text-blue-400 underline">support@davinciwalebhaiya.com</a>.
        </p>
      </section>

      {/* 8. Data Security */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          8. Data Security
        </h2>
        <p>
          We implement rigorous technical safeguards, including 256-bit TLS/SSL encryption for all data in transit, encrypted databases at rest, row-level database security policies, and temporary pre-signed URLs with automated expiration for file downloads.
        </p>
      </section>

      {/* 9. User Rights */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          9. Your Rights
        </h2>
        <p>Depending on your jurisdiction, you may possess the following rights regarding your personal data:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300">
          <li>The right to request a copy of personal information we hold about you.</li>
          <li>The right to rectify inaccurate or incomplete contact details.</li>
          <li>The right to request deletion of your account.</li>
          <li>The right to unsubscribe from optional dispatch newsletters at any time.</li>
        </ul>
      </section>

      {/* 10. Children's Privacy */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          10. Children&apos;s Privacy
        </h2>
        <p>
          DavinciWaleBhaiya does not knowingly collect or solicit personal information from anyone under the age of 13. If we learn that we have collected personal data from a child under 13 without verified parental consent, we will promptly delete that information from our servers.
        </p>
      </section>

      {/* 11. Policy Updates */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          11. Policy Updates
        </h2>
        <p>
          We may update this Privacy Policy from time to time to reflect operational or regulatory changes. The date of the most recent revision will always be noted at the top of this document. Continued use of our site after updates indicates acceptance of the amended policy.
        </p>
      </section>

      {/* 12. Contact Information */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          12. Contact Information
        </h2>
        <p>
          For any questions, data access requests, or privacy concerns, please contact our privacy representative:
        </p>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1.5 text-slate-300">
          <div><strong className="text-white">Business Entity:</strong> [Business Legal Name] (DavinciWaleBhaiya)</div>
          <div><strong className="text-white">Privacy Officer Email:</strong> support@davinciwalebhaiya.com</div>
          <div><strong className="text-white">Operating Address:</strong> [Business Address], India</div>
        </div>
      </section>
    </LegalLayout>
  );
}

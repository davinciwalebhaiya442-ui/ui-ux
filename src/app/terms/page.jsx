import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions governing the use of DavinciWaleBhaiya digital assets, plugins, presets, and services.',
};

export default function TermsPage() {
  return (
    <LegalLayout
      badge="Legal Agreement"
      title="Terms & Conditions"
      lastUpdated="October 1, 2026"
      description="Please read these Terms and Conditions carefully before purchasing, downloading, or using digital assets, plugins, presets, and utilities from DavinciWaleBhaiya."
    >
      {/* 1. Introduction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          1. Introduction & Acceptance
        </h2>
        <p>
          Welcome to <strong className="text-white">DavinciWaleBhaiya</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), accessible via <strong className="text-white">davinciwalebhaiya.com</strong>. By accessing our website, creating an account, browsing our catalogue, downloading free assets, or purchasing paid digital assets, you agree to be bound by these Terms and Conditions (&ldquo;Terms&rdquo;) and our Privacy Policy.
        </p>
        <p>
          If you do not agree with any part of these Terms, you must immediately discontinue using this website and refrain from purchasing or downloading our products.
        </p>
      </section>

      {/* 2. About DavinciWaleBhaiya */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          2. About DavinciWaleBhaiya
        </h2>
        <p>
          DavinciWaleBhaiya is a digital creative platform and engineering studio dedicated to video editors, colorists, and post-production artists. We provide specialized digital tools, DaVinci Color Transform Language (.dctl) scripts, DaVinci Resolve OpenFX presets, Fusion composition macros, PowerGrades, look-up tables (LUTs), and educational content.
        </p>
        <p className="text-xs text-slate-400 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <strong>Notice:</strong> DaVinci Resolve&reg; is a registered trademark of Blackmagic Design Pty Ltd. DavinciWaleBhaiya is an independent creator and tools developer and is not affiliated with, endorsed by, or sponsored by Blackmagic Design Pty Ltd.
        </p>
      </section>

      {/* 3. Eligibility & User Accounts */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          3. Eligibility & User Accounts
        </h2>
        <p>
          To purchase products, save assets, or access downloadable files, you must be at least 18 years of age (or the age of legal majority in your jurisdiction). When registering for an account:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300">
          <li>You agree to provide true, accurate, current, and complete information.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials and password.</li>
          <li>You accept sole responsibility for all activity conducted through your account.</li>
          <li>You must notify us immediately at <a href="mailto:support@davinciwalebhaiya.com" className="text-blue-400 underline">support@davinciwalebhaiya.com</a> if you suspect any unauthorized access to your account.</li>
        </ul>
      </section>

      {/* 4. Digital Products & Electronic Delivery */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          4. Digital Products & Specifications
        </h2>
        <p>
          All products offered on DavinciWaleBhaiya are <strong className="text-white">intangible digital products</strong> (including compressed ZIP archives, DCTL files, DRX PowerGrade files, .setting Fusion macros, and 3D LUTs).
        </p>
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200 space-y-1">
          <p className="font-semibold text-blue-100">Electronic Delivery Only:</p>
          <p>
            No physical goods, DVDs, flash drives, or packaging are manufactured, shipped, or delivered. All transactions are fulfilled electronically through instant download links and your account library.
          </p>
        </div>
        <p>
          You are responsible for reviewing product descriptions, system requirements, DaVinci Resolve version compatibility (e.g., Free vs. Studio version requirements), and hardware prerequisites prior to making a purchase.
        </p>
      </section>

      {/* 5. Product Licensing & Usage Rights */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          5. Product Licensing & Usage Rights
        </h2>
        <p>
          When you purchase a paid product or download a free asset from DavinciWaleBhaiya, you are granted a <strong className="text-white">non-exclusive, non-transferable, perpetual, single-user commercial license</strong> to use the assets subject to the following terms:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-2">
            <span className="font-semibold text-emerald-400 block font-mono uppercase tracking-wider">
              &check; What You CAN Do:
            </span>
            <ul className="space-y-1 text-slate-300">
              <li>&bull; Use in unlimited personal and commercial video projects (YouTube, client commercials, TV broadcasts, theatrical films, music videos, social media).</li>
              <li>&bull; Render and export final video deliverables containing our effects, grades, or macros without royalty payments.</li>
              <li>&bull; Install the files on up to two (2) personal workstations operated exclusively by you (e.g., your desktop and laptop).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs space-y-2">
            <span className="font-semibold text-rose-400 block font-mono uppercase tracking-wider">
              &cross; What You CANNOT Do:
            </span>
            <ul className="space-y-1 text-slate-300">
              <li>&bull; Resell, re-license, redistribute, sub-license, share, or torrent the raw source files or download links.</li>
              <li>&bull; Include the raw DCTLs, macros, or LUTs in another asset pack, marketplace bundle, or software tool.</li>
              <li>&bull; Share your login or download keys with third parties or upload files to public file-sharing networks.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Purchases & Payments */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          6. Purchases & Payments
        </h2>
        <p>
          All pricing displayed on the website is indicated in Indian Rupees (INR) or other specified currencies. We reserve the right to modify product prices, introduce discounts, or discontinue products at any time without prior notice.
        </p>
        <p>
          All online payments are securely processed by authorized third-party payment gateways, including <strong className="text-white">Razorpay</strong>. We accept UPI, debit/credit cards, and internet banking. We do not store or process sensitive payment credentials such as credit card numbers, CVV, or banking passwords on our servers.
        </p>
      </section>

      {/* 7. Digital Downloads & Account Library */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          7. Digital Downloads & Account Library
        </h2>
        <p>
          Upon successful payment verification, access to your purchased digital files is immediately enabled in your <strong className="text-white">Account Library</strong> (<a href="/account/library" className="text-blue-400 underline">/account/library</a>). Additionally, an automated order confirmation email containing your direct download links will be transmitted to your registered email address.
        </p>
        <p>
          We recommend downloading and safely archiving your purchased files to a local backup drive immediately upon receipt.
        </p>
      </section>

      {/* 8. Free Assets */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          8. Free Assets & Community Tools
        </h2>
        <p>
          We provide select tools and presets at zero cost for community learning and professional utility. Free assets remain the intellectual property of DavinciWaleBhaiya and are governed by the same licensing restrictions (i.e., you may use them in personal and commercial productions, but you may not redistribute or resell the raw files).
        </p>
      </section>

      {/* 9. Intellectual Property */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          9. Intellectual Property
        </h2>
        <p>
          All content on DavinciWaleBhaiya, including but not limited to software code, DCTL algorithms, mathematical color transform logic, UI designs, graphics, branding, text, tutorials, and logos, is the exclusive intellectual property of DavinciWaleBhaiya and is protected by copyright and intellectual property laws.
        </p>
        <p>
          Purchasing an asset grants you a license to use the product; it does not transfer ownership of the underlying intellectual property or copyrights to you.
        </p>
      </section>

      {/* 10. Prohibited Use */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          10. Prohibited Use
        </h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300">
          <li>Decompile, reverse-engineer, or disassemble any compiled binaries, shaders, or proprietary code provided on this platform.</li>
          <li>Use automated scrapers, bots, or unauthorized scripts to harvest files, user data, or asset links.</li>
          <li>Circumvent download token limits, license checks, or security measures implemented on the website.</li>
          <li>Engage in fraudulent transactions or make chargeback claims in bad faith.</li>
        </ul>
      </section>

      {/* 11. Account Suspension & Termination */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          11. Account Suspension & Termination
        </h2>
        <p>
          We reserve the right to suspend or terminate your account and revoke download privileges without notice if we detect a breach of these Terms, unauthorized redistributions of our intellectual property, fraudulent payment activity, or abusive behavior toward our staff or community.
        </p>
      </section>

      {/* 12. Third-Party Services */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          12. Third-Party Services & Links
        </h2>
        <p>
          Our platform integrates trusted third-party service providers (such as Supabase for authentication, Razorpay for payment processing, Cloudflare R2 for asset storage, and Resend for transactional email). We are not responsible for the independent terms, policies, or service disruptions of these external providers.
        </p>
      </section>

      {/* 13. Disclaimer of Warranties */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          13. Disclaimer of Warranties
        </h2>
        <p>
          DavinciWaleBhaiya digital products and website services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied. While we strive to ensure our tools operate smoothly across supported DaVinci Resolve versions and operating systems, we do not warrant that our products will be error-free, uninterrupted, or compatible with unsupported hardware configurations.
        </p>
      </section>

      {/* 14. Limitation of Liability */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          14. Limitation of Liability
        </h2>
        <p>
          To the maximum extent permitted by applicable law, in no event shall DavinciWaleBhaiya, its owners, developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages (including loss of profits, data loss, project delivery delays, or timeline corruption) arising out of or related to the use of or inability to use our digital assets. Our total cumulative liability shall in no circumstance exceed the amount actually paid by you for the specific product giving rise to the claim.
        </p>
      </section>

      {/* 15. Changes to Terms */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          15. Changes to Terms
        </h2>
        <p>
          We reserve the right to revise or update these Terms and Conditions at any time. Any changes will become effective immediately upon posting to this page, with an updated revision date. Your continued use of the website following any changes constitutes your binding acceptance of the new Terms.
        </p>
      </section>

      {/* 16. Contact Information */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          16. Contact Information
        </h2>
        <p>
          If you have questions, feedback, or legal inquiries regarding these Terms & Conditions, please contact us:
        </p>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1.5 text-slate-300">
          <div><strong className="text-white">Business Entity:</strong> [Business Legal Name] (Operating as DavinciWaleBhaiya)</div>
          <div><strong className="text-white">Email:</strong> support@davinciwalebhaiya.com</div>
          <div><strong className="text-white">Website:</strong> https://davinciwalebhaiya.com</div>
          <div><strong className="text-white">Operating Location:</strong> [Business Address], India</div>
        </div>
      </section>
    </LegalLayout>
  );
}

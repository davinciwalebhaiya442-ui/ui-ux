import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Digital delivery and electronic fulfillment policy for digital assets purchased on DavinciWaleBhaiya.',
};

export default function ShippingPolicyPage() {
  return (
    <LegalLayout
      badge="Fulfillment & Electronic Delivery"
      title="Shipping & Delivery Policy"
      lastUpdated="October 1, 2026"
      description="DavinciWaleBhaiya provides strictly electronic digital products. Please review our automated digital delivery, library access, and fulfillment protocols."
    >
      {/* 1. Digital Delivery Statement */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          1. 100% Digital Delivery — No Physical Shipping
        </h2>
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs sm:text-sm text-blue-200 space-y-2">
          <p className="font-semibold text-blue-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            No Physical Goods or Courier Shipping
          </p>
          <p>
            <strong className="text-white">DavinciWaleBhaiya operates exclusively as a digital asset platform.</strong> We do not sell or ship physical products, hardware, storage media, DVDs, or USB drives. No physical parcel, courier, or postal tracking number will be issued.
          </p>
          <p className="text-slate-300">
            All purchases, whether paid plugins, DCTLs, macros, or free community tools, are fulfilled <strong className="text-white">100% electronically</strong> via high-speed cloud download links.
          </p>
        </div>
      </section>

      {/* 2. When & How Access Becomes Available */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          2. Delivery Timelines & Availability
        </h2>
        <p>
          Electronic delivery is automated and occurs almost instantaneously:
        </p>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-2.5 text-slate-300">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-white font-medium">Free Assets Delivery:</span>
            <span className="text-emerald-400">Instant (Immediate Direct Download)</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-white font-medium">Paid Products Delivery:</span>
            <span className="text-blue-400">Instant (0 to 5 minutes post-payment verification)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Account Library Status:</span>
            <span className="text-purple-400">Perpetual Access (24/7/365)</span>
          </div>
        </div>
      </section>

      {/* 3. Where to Access Your Purchases */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          3. Where & How to Access Your Files
        </h2>
        <p>
          Following a successful checkout transaction, your purchased assets are delivered through three concurrent channels:
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-blue-400">
              Channel 1: Order Confirmation Screen
            </h3>
            <p className="text-xs text-slate-300">
              Immediately after Razorpay confirms your payment, you will be redirected to the order confirmation page with a direct button to download your files or open your account library.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-blue-400">
              Channel 2: Account Library (/account/library)
            </h3>
            <p className="text-xs text-slate-300">
              Your purchased items are permanently bound to your registered account. You can log in at any time from any workstation, navigate to your <a href="/account/library" className="text-blue-400 underline">Account Library</a>, and generate fresh signed download links on demand.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-blue-400">
              Channel 3: Automated Email Confirmation
            </h3>
            <p className="text-xs text-slate-300">
              An automated receipt is dispatched via Resend to the email address associated with your purchase. This email contains your order number and direct secure download links.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Download Process & File Formats */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          4. Download Process & Included Files
        </h2>
        <p>
          All assets are delivered as high-compression <strong className="text-white">.ZIP archives</strong> hosted on enterprise-grade Cloudflare R2 object storage. Each package typically includes:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs sm:text-sm">
          <li>Core tool files (.dctl, .setting, .drx, or .cube LUT files).</li>
          <li>Comprehensive installation and node setup guide (PDF or Markdown).</li>
          <li>Sample footage / test frame reference (where applicable).</li>
          <li>License document and version changelog.</li>
        </ul>
      </section>

      {/* 5. What If Download Fails or Link Expires? */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          5. Download Troubleshooting & Resolving Access Issues
        </h2>
        <p>
          If you experience any issue receiving or opening your digital files, follow these steps:
        </p>
        <div className="space-y-3 pt-1">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300">
            <strong className="text-white block mb-0.5">1. Check Spam / Promotions Folder</strong>
            If you have not received your confirmation email within 5 minutes, please inspect your spam, junk, or updates folder for mail from <code className="text-blue-300">support@davinciwalebhaiya.com</code>.
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300">
            <strong className="text-white block mb-0.5">2. Check Your Account Library</strong>
            Log in at <a href="/account/library" className="text-blue-400 underline">davinciwalebhaiya.com/account/library</a>. If the payment was captured, your purchase will appear there automatically. Click the download button to receive a fresh secure link.
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300">
            <strong className="text-white block mb-0.5">3. Payment Debited but Product Not Showing</strong>
            If your bank confirms a debit but the browser crashed or the page was closed during checkout, the webhook may take a moment to synchronize. If your files are not visible after 15 minutes, email our support team with your transaction screenshot. We will manually attach the product to your account or issue a full refund.
          </div>
        </div>
      </section>

      {/* 6. Support & Contact */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          6. Delivery Support SLA
        </h2>
        <p>
          We monitor our digital fulfillment systems 24/7. In the rare event of a CDN outage or link issue, our support team will manually deliver your archive files via alternate secure transfer (e.g., direct cloud link).
        </p>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1.5 text-slate-300">
          <div><strong className="text-white">Delivery Support Email:</strong> support@davinciwalebhaiya.com</div>
          <div><strong className="text-white">Support Response Window:</strong> Within 2 to 24 hours</div>
          <div><strong className="text-white">Operating Entity:</strong> [Business Legal Name] (DavinciWaleBhaiya)</div>
          <div><strong className="text-white">Operating Location:</strong> [Business Address], India</div>
        </div>
      </section>
    </LegalLayout>
  );
}

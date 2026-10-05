import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Refund, return, and cancellation policy for digital products and assets purchased on DavinciWaleBhaiya.',
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      badge="Payments & Consumer Protection"
      title="Refund & Cancellation Policy"
      lastUpdated="October 1, 2026"
      description="Clear, transparent terms regarding digital orders, cancellations, duplicate charge reversals, and technical support resolution for DavinciWaleBhaiya digital assets."
    >
      {/* 1. Nature of Digital Goods */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          1. Digital & Intangible Products
        </h2>
        <p>
          All products available on <strong className="text-white">DavinciWaleBhaiya</strong> (such as DCTL transforms, OpenFX presets, Fusion macros, PowerGrades, LUTs, and digital project templates) are <strong className="text-white">intangible, downloadable digital goods</strong>.
        </p>
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200 space-y-1">
          <p className="font-semibold text-blue-100">Electronic Delivery Notice:</p>
          <p>
            No physical goods, discs, packaging, or parcels are shipped. Since digital files are delivered electronically and become immediately accessible upon payment, special refund conditions apply under digital commerce guidelines.
          </p>
        </div>
      </section>

      {/* 2. Order Cancellation Policy */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          2. Order Cancellation Policy
        </h2>
        <p>
          Because our systems automatically verify payments via Razorpay and immediately generate access keys and digital download archives in your customer account, <strong className="text-white">orders cannot be cancelled once digital files have been delivered, viewed, or downloaded</strong>.
        </p>
        <p>
          If you have initiated a transaction by mistake and have <strong className="text-white">not yet downloaded or accessed</strong> the digital files, please contact us immediately at <a href="mailto:support@davinciwalebhaiya.com" className="text-blue-400 underline">support@davinciwalebhaiya.com</a> within 24 hours of purchase with your order details.
        </p>
      </section>

      {/* 3. Refund Eligibility */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          3. Refund Eligibility & Approved Scenarios
        </h2>
        <p>We are committed to fair customer treatment. We will gladly issue a prompt refund under the following verified circumstances:</p>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>&bull;</span> Duplicate or Accidental Multiple Charges
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an internet lag or payment gateway glitch causes your account, UPI ID, or card to be charged more than once for the same digital item, we will immediately initiate a 100% refund for the duplicate transaction upon verification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>&bull;</span> Payment Deducted but Order/Access Not Generated
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If your bank or UPI account was debited, but the payment gateway failed to communicate with our system (resulting in no order confirmation or missing library access), we will either manually provision your access within 12 hours or issue a full refund at your request.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>&bull;</span> Verified Technical Defect or Corrupted Archive
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an asset archive is verified to be technically broken, missing critical core files, or mathematically corrupted, and our technical support team is unable to provide a functional replacement, patch, or alternate download link within 48 hours of your report, you are entitled to a full refund.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>&bull;</span> Unauthorized / Fraudulent Transactions
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an unauthorized charge was made on your card or UPI ID without your consent, please notify both your bank and our support team immediately. Following banking gateway verification, fraudulent charges will be reversed.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Non-Refundable Scenarios */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          4. Non-Refundable Scenarios
        </h2>
        <p>Refunds will generally <strong className="text-white">not</strong> be issued in the following situations:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm">
          <li>
            <strong className="text-white">Change of Mind:</strong> Deciding you no longer need or want the tool after having already downloaded the archive.
          </li>
          <li>
            <strong className="text-white">System Incompatibility:</strong> Purchasing a tool without checking explicitly listed software requirements (e.g., purchasing a DCTL that clearly specifies &ldquo;Requires DaVinci Resolve Studio&rdquo; while you are using the free version of DaVinci Resolve, or using an unsupported operating system).
          </li>
          <li>
            <strong className="text-white">Insufficient Hardware:</strong> Inability to run high-resolution 32-bit floating point nodes due to hardware limitations (such as insufficient GPU VRAM) when requirements are clearly disclosed.
          </li>
          <li>
            <strong className="text-white">Lack of Skill:</strong> Unfamiliarity with DaVinci Resolve node trees or general video editing operations (free installation guides and video tutorials are provided for every tool).
          </li>
        </ul>
      </section>

      {/* 5. Refund Processing Timeline */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          5. Refund Processing Timeline
        </h2>
        <p>
          Once an eligible refund request is approved by our team:
        </p>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-2 text-slate-300">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
            <span className="text-white">Approval Window:</span>
            <span className="text-blue-400">Within 24 to 48 Hours</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
            <span className="text-white">Gateway Processing (Razorpay):</span>
            <span className="text-blue-400">Initiated immediately upon approval</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Credit to Your Bank / UPI / Card:</span>
            <span className="text-emerald-400 font-semibold">5 to 7 Business Days</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Note: Refund processing speed depends on your individual banking provider and payment method (UPI refunds are typically faster than credit card billing cycles).
        </p>
      </section>

      {/* 6. How to Request Support or a Refund */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white border-b border-white/[0.08] pb-2">
          6. How to Request Support or a Refund
        </h2>
        <p>
          To submit a refund or transaction inquiry, please write to our support desk with the subject line <code className="text-xs bg-white/10 px-2 py-0.5 rounded text-blue-300">Refund Request &mdash; [Your Order Number]</code>:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs sm:text-sm">
          <li>Your registered account email address.</li>
          <li>Your Order ID (e.g., <code className="text-xs bg-white/10 px-1 py-0.5 rounded">ORD-XXXX</code>) or Razorpay Payment ID.</li>
          <li>A clear description of the technical issue or the reason for your refund request.</li>
          <li>Screenshots or video error recordings if reporting a technical file issue.</li>
        </ul>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1.5 text-slate-300 mt-3">
          <div><strong className="text-white">Official Support Email:</strong> support@davinciwalebhaiya.com</div>
          <div><strong className="text-white">Operating Entity:</strong> [Business Legal Name] (DavinciWaleBhaiya)</div>
          <div><strong className="text-white">Registered Address:</strong> [Business Address], India</div>
        </div>
      </section>
    </LegalLayout>
  );
}

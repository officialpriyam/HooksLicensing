'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Globe,
  Key,
  Link2,
  Package,
  Settings,
  Terminal,
  Webhook,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative rounded-lg bg-slate-900 border border-slate-700 overflow-hidden my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <><CheckCircle className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-slate-200 font-mono leading-relaxed">{code}</pre>
    </div>
  )
}

function Step({ number, title, icon: Icon, children }: {
  number: number
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="relative flex gap-6 mb-12">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-600 text-white font-bold text-lg shadow-lg shadow-violet-600/30 shrink-0">
          {number}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-violet-600/40 to-transparent mt-3" />
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="text-slate-300 space-y-3">{children}</div>
      </div>
    </div>
  )
}

function InfoBox({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: Info,        iconColor: 'text-blue-400',   label: 'Info' },
    warning: { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  icon: AlertCircle, iconColor: 'text-amber-400',  label: 'Note' },
    tip:     { bg: 'bg-green-500/10',  border: 'border-green-500/30',  icon: CheckCircle, iconColor: 'text-green-400',  label: 'Tip' },
  }
  const { bg, border, icon: Icon, iconColor, label } = styles[type]
  return (
    <div className={`flex gap-3 ${bg} border ${border} rounded-lg p-4 my-4`}>
      <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
      <div>
        <span className={`font-semibold ${iconColor}`}>{label}: </span>
        <span className="text-slate-300">{children}</span>
      </div>
    </div>
  )
}

export default function BuiltByBitDocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/admin/integrations" className="hover:text-white transition-colors">Integrations</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">BuiltByBit Guide</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">BuiltByBit Integration</h1>
                <Badge variant="secondary" className="bg-violet-600/20 text-violet-300 border-violet-600/30">Guide</Badge>
              </div>
              <p className="text-slate-400 mt-0.5">
                Automatically deliver license keys when customers purchase your products on BuiltByBit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Automatic Delivery', desc: 'Licenses sent instantly after purchase', icon: CheckCircle },
              { label: 'Secure Webhooks', desc: 'HMAC-SHA256 signature verification', icon: Key },
              { label: 'Zero Manual Work', desc: 'Fully automated — no intervention needed', icon: Settings },
            ].map(({ label, desc, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <Icon className="w-5 h-5 text-violet-400 mb-2" />
                <p className="font-medium text-sm text-white">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 mb-12">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" />
            How it works
          </h2>
          <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400">
            {[
              'Customer purchases on BuiltByBit',
              '→',
              'BBB calls your Webhook URL',
              '→',
              'HookLicense verifies the signature',
              '→',
              'License auto-generated & delivered',
            ].map((item, i) => (
              <span key={i} className={item === '→' ? 'text-violet-500' : 'bg-slate-800 px-2.5 py-1 rounded-md text-slate-300'}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          {/* Step 1 */}
          <Step number={1} title="Get the Webhook URL from HookLicense" icon={Webhook}>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Navigate to the <Link href="/admin/integrations" className="text-violet-400 hover:underline">Integrations page</Link> in your HookLicense dashboard.</li>
              <li>Click the <strong className="text-white">BuiltByBit</strong> tab.</li>
              <li>Select the product you want to link from the dropdown.</li>
              <li>Copy the generated <strong className="text-white">Webhook URL</strong>.</li>
            </ol>

            <p className="mt-3 text-slate-400 text-sm">The webhook URL format is:</p>
            <CodeBlock language="url" code={`{yourdomain}/api/v1/bbb/{productId}`} />

            <InfoBox type="info">
              The Product ID in the URL corresponds to the product you selected in HookLicense. Make sure you select the correct product before copying the URL.
            </InfoBox>
          </Step>

          {/* Step 2 */}
          <Step number={2} title="Create a Placeholder in BuiltByBit" icon={Link2}>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                Go to the{' '}
                <a
                  href="https://builtbybit.com/account/placeholders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  Placeholders page <ExternalLink className="w-3 h-3" />
                </a>
                {' '}on BuiltByBit.
              </li>
              <li>Click <strong className="text-white">Create New Placeholder</strong>.</li>
              <li>Set the placeholder name — for example:</li>
            </ol>

            <CodeBlock language="placeholder name" code={`%%MyProduct_License%%`} />

            <ol className="list-decimal list-inside space-y-2 text-slate-300 mt-3" start={4}>
              <li>Set <strong className="text-white">Type</strong> to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-violet-300 text-sm">External License Key</code>.</li>
              <li>Paste the <strong className="text-white">Webhook URL</strong> you copied from HookLicense into the <strong className="text-white">URL</strong> field.</li>
              <li>Go back to HookLicense → Integrations → BuiltByBit and copy the <strong className="text-white">Secret Key</strong>.</li>
              <li>Paste the Secret Key into the BuiltByBit placeholder secret field.</li>
              <li>Save the placeholder.</li>
            </ol>

            <InfoBox type="warning">
              Keep your Secret Key private. It is used to verify that webhook calls are genuinely from BuiltByBit and not forged requests.
            </InfoBox>
          </Step>

          {/* Step 3 */}
          <Step number={3} title="Use the Placeholder in Your Product" icon={Package}>
            <p>
              When adding the license key field to your BuiltByBit resource, use the placeholder string as the value.
              BuiltByBit will replace it automatically with the buyer's real license key after purchase.
            </p>

            <p className="mt-4 font-medium text-white">Example usage in Java (HookLicenseAPI):</p>
            <CodeBlock language="java" code={`String key = "%%MyProduct_License%%";

SunLicenseAPI api = HookLicenseAPI.getLicense(
    key,                        // License key (placeholder — replaced automatically)
    1,                          // Product ID (integer)
    "1.0.0",                    // Product version
    "http://yourdomain.com/"    // API endpoint
);

api.validate();`} />

            <p className="mt-4 font-medium text-white">Example usage in JavaScript/Node.js:</p>
            <CodeBlock language="javascript" code={`const key = "%%MyProduct_License%%";

const result = await fetch("http://yourdomain.com/api/validate-license", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    licenseKey: key,
    productId: "your-product-id",
    version: "1.0.0",
  }),
});

const data = await result.json();
if (data.status !== "valid") process.exit(1);`} />

            <p className="mt-4 font-medium text-white">Example usage in PHP:</p>
            <CodeBlock language="php" code={`<?php
$licenseKey = "%%MyProduct_License%%";
$productId  = "your-product-id";
$apiUrl     = "http://yourdomain.com/api/validate-license";

$response = file_get_contents($apiUrl . "?" . http_build_query([
    "licenseKey" => $licenseKey,
    "productId"  => $productId,
    "version"    => "1.0.0",
]));

$data = json_decode($response, true);
if ($data["status"] !== "valid") die("License invalid.");
?>`} />

            <InfoBox type="tip">
              The placeholder <code className="bg-slate-800 px-1.5 py-0.5 rounded text-violet-300 text-sm">%%MyProduct_License%%</code> is replaced at download time with the real license key, so your customers never need to copy or paste anything manually.
            </InfoBox>
          </Step>

          {/* Step 4 */}
          <Step number={4} title="Automatic License Assignment" icon={CheckCircle}>
            <p>
              Once everything is configured, the entire flow is fully automatic:
            </p>

            <div className="mt-4 space-y-3">
              {[
                { step: '1', text: 'A customer purchases your product on BuiltByBit.' },
                { step: '2', text: 'BuiltByBit triggers a webhook POST request to your HookLicense Webhook URL.' },
                { step: '3', text: 'HookLicense verifies the request using the shared Secret Key (HMAC-SHA256).' },
                { step: '4', text: 'A new unique license key is generated and assigned to the buyer.' },
                { step: '5', text: 'The placeholder %%MyProduct_License%% in the download is replaced with the buyer\'s real license key.' },
                { step: '6', text: 'The customer downloads the product and their license works immediately — no manual steps needed.' },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
                  <span className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step}
                  </span>
                  <p className="text-sm text-slate-300">{text}</p>
                </div>
              ))}
            </div>

            <InfoBox type="tip">
              If a customer's Discord account is linked to HookLicense, they will also receive their license key as a Discord DM automatically.
            </InfoBox>
          </Step>
        </div>

        {/* Troubleshooting */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 mb-12">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Troubleshooting
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Webhook returns 403 Forbidden',
                a: 'The Secret Key does not match. Double-check that you copied the exact secret from HookLicense and pasted it into the BuiltByBit placeholder settings.',
              },
              {
                q: 'Webhook returns 404 Not Found',
                a: 'The Webhook URL is incorrect or the product ID does not exist. Go back to Integrations → BuiltByBit, select the correct product, and recopy the URL.',
              },
              {
                q: 'License not delivered to customer',
                a: "Check that the product is properly selected in the BuiltByBit tab. Also verify that the placeholder name matches exactly what's in your resource files (including the %% delimiters).",
              },
              {
                q: 'Placeholder not replaced at download',
                a: 'Ensure the BuiltByBit resource is configured to use the placeholder in the download version field, not just the description. The Type must be set to External License Key.',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-medium text-white text-sm">{q}</p>
                <p className="text-slate-400 text-sm mt-1">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/integrations">
            <Button variant="default" className="bg-violet-600 hover:bg-violet-700">
              Go to Integrations
            </Button>
          </Link>
          <a href="https://builtbybit.com/account/placeholders" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              BuiltByBit Placeholders <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </a>
          <a href="https://builtbybit.com/wiki/webhooks/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              BBB Webhook Docs <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

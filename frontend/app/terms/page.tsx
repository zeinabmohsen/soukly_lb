import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service · Soukly",
  description: "The terms that govern your use of Soukly as a buyer or seller.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="May 31, 2026"
      intro="These terms govern your use of Soukly — our marketplace platform for Lebanese sellers and the shoppers who buy from them. By creating an account, opening a store, or placing an order, you agree to the terms below."
      sections={[
        {
          heading: "Your account",
          body: [
            "You must provide accurate information when you register and keep it up to date. You are responsible for activity that happens under your account and for keeping your password secure.",
            "You must be able to form a binding contract under Lebanese law to use Soukly. One person or business may not maintain duplicate accounts to abuse promotions or evade enforcement.",
          ],
        },
        {
          heading: "Selling on Soukly",
          body: [
            "Opening a store requires approval. We review each application and may approve, decline, or later suspend a store that violates these terms or applicable law.",
            "Paid plans (Starter, Pro, and Premium) begin after a 30-day free trial and renew monthly until cancelled. You are responsible for the accuracy of your listings, fulfilment of orders, and any taxes that apply to your sales.",
            "You retain ownership of the content you upload, and you grant Soukly a licence to display it on the platform for the purpose of operating your store.",
          ],
        },
        {
          heading: "Buying on Soukly",
          body: [
            "Orders are a contract between you and the seller. Soukly facilitates discovery, checkout, and communication but is not the seller of record unless stated otherwise.",
            "Prices, availability, and delivery estimates are set by sellers and may change. If an issue arises with an order, contact the seller first; we will help mediate where we can.",
          ],
        },
        {
          heading: "Payments and fees",
          body: [
            "Subscription fees are billed in advance for the plan you select. Where Soukly processes payments, we use third-party providers and do not store full card details on our own servers.",
            "Fees are non-refundable except where required by law or expressly stated. You can change or cancel your plan at any time from your seller dashboard; changes take effect at the end of the current billing period.",
          ],
        },
        {
          heading: "Acceptable use",
          body: [
            "Do not use Soukly to sell illegal, counterfeit, or prohibited goods, to infringe others' rights, to post misleading content, or to interfere with the platform's operation or security.",
            "We may remove content, limit features, or suspend accounts that breach these rules, and we may report unlawful activity to the appropriate authorities.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Soukly is provided \"as is.\" To the extent permitted by law, we are not liable for indirect or consequential losses, or for disputes, products, or conduct between buyers and sellers.",
            "Nothing in these terms limits liability that cannot be limited under applicable law.",
          ],
        },
        {
          heading: "Changes and termination",
          body: [
            "We may update these terms as the platform evolves. Material changes will be communicated, and continued use after they take effect means you accept them.",
            "You may close your account at any time. We may suspend or terminate access for breaches of these terms.",
          ],
        },
      ]}
    />
  )
}

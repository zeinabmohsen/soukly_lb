import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy · Soukly",
  description: "How Soukly collects, uses, and protects your personal data.",
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="May 31, 2026"
      intro="This policy explains what personal data Soukly collects, why we collect it, and the choices you have. It applies to shoppers, sellers, and visitors to the platform."
      sections={[
        {
          heading: "What we collect",
          body: [
            "Account data you provide: your name, email, phone number (optional), and password. Sellers also provide store details such as business name, category, and location.",
            "Transaction data: orders, items, addresses you enter at checkout, and subscription status for sellers.",
            "Technical data: basic device and usage information needed to operate the platform securely, such as session and authentication tokens.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To create and secure your account, process orders, run seller subscriptions, provide support, and improve the platform.",
            "To communicate with you about your account, applications, and orders — for example, the email we send when a seller application is reviewed.",
            "We do not sell your personal data.",
          ],
        },
        {
          heading: "Authentication and security",
          body: [
            "We sign you in using short-lived access tokens kept only in memory and a refresh token stored in a secure, http-only cookie. Your password is never stored in plain text.",
            "We apply reasonable technical and organisational measures to protect your data, but no system is perfectly secure.",
          ],
        },
        {
          heading: "Sharing",
          body: [
            "When you place an order, the relevant order and delivery details are shared with the seller so they can fulfil it.",
            "We use trusted third-party providers (for example, payment and hosting services) that process data on our behalf under appropriate safeguards.",
            "We may disclose data where required by law or to protect the rights and safety of our users and the platform.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You can view and update most of your account information from your profile. You may request access to, correction of, or deletion of your personal data by contacting us.",
            "You can opt out of non-essential communications at any time.",
          ],
        },
        {
          heading: "Retention",
          body: [
            "We keep personal data for as long as your account is active and as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "For privacy questions or to exercise your rights, email support@soukly.com. We may update this policy as the platform evolves and will note the date of the latest change above.",
          ],
        },
      ]}
    />
  )
}

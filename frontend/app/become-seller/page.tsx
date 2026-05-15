"use client"

export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SellerApplicationForm from "@/components/seller-application-form"

export default function BecomeSellerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SellerApplicationForm />
      </Suspense>
      <Footer />
    </main>
  )
}

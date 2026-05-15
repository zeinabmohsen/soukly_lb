"use client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SellerApplicationForm from "@/components/seller-application-form"

export default function BecomeSellerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      <SellerApplicationForm />
      <Footer />
    </main>
  )
}

import { Navbar } from "@/components/informative/Navbar"
import { Hero } from "@/components/informative/Hero"
import { StylistIntro } from "@/components/informative/StylistIntro"
import { Features } from "@/components/informative/Features"
import { HowItWorks } from "@/components/informative/HowItWorks"
import { ProfileSection } from "@/components/informative/ProfileSection"
import { SmartShopping } from "@/components/informative/SmartShopping"
import { UseCases } from "@/components/informative/UseCases"
import { Privacy } from "@/components/informative/Privacy"
import { FinalCTA } from "@/components/informative/FinalCTA"
import { Footer } from "@/components/informative/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <StylistIntro />
      <Features />
      <HowItWorks />
      <ProfileSection />
      <SmartShopping />
      <UseCases />
      <Privacy />
      <FinalCTA />
      <Footer />
    </main>
  )
}

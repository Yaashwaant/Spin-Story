import { Navbar } from "@/components/informative/Navbar"
import { Hero } from "@/components/informative/Hero"
import { StylistIntro } from "@/components/informative/StylistIntro"

export default function InformativePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StylistIntro />
    </main>
  )
}
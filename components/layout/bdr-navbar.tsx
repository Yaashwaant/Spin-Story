"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { Home, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export function BdrNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const isBdrPage = pathname?.startsWith("/bdr")

  const handleSignOut = async () => {
    await signOut()
    router.push("/bdr/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/bdr" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">BDR Portal</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/bdr"
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors",
              isBdrPage ? "text-slate-900" : "hover:text-slate-900",
            )}
          >
            <span>Home</span>
            <span
              className={cn(
                "pointer-events-none absolute inset-x-3 bottom-1 h-px origin-center scale-x-0 bg-slate-900 transition-transform duration-200 ease-out",
                isBdrPage && "scale-x-100",
              )}
            />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-slate-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  )
}
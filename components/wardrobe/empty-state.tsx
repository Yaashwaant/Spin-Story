import { Card, CardContent } from "@/components/ui/card"

export function EmptyWardrobeState() {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-6 flex h-24 w-24 items-center justify-center">
          {/* Clothing rack illustration */}
          <svg viewBox="0 0 100 100" className="h-full w-full text-slate-300">
            <rect x="20" y="10" width="60" height="6" rx="3" fill="currentColor" />
            <rect x="25" y="16" width="4" height="60" fill="currentColor" />
            <rect x="71" y="16" width="4" height="60" fill="currentColor" />
            <rect x="15" y="76" width="70" height="4" rx="2" fill="currentColor" />
            {/* Hangers */}
            <path
              d="M40 16 L40 25 L35 35 M40 25 L45 35"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M55 16 L55 25 L50 35 M55 25 L60 35"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">Your wardrobe is empty!</h3>
        <p className="text-center text-sm text-muted-foreground max-w-xs">
          Start by adding some clothes to get magic recommendations.
        </p>
      </CardContent>
    </Card>
  )
}

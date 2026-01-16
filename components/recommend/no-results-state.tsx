import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"
import Link from "next/link"

export function NoResultsState() {
  return (
    <Card className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border-border/50 shadow-sm">
      <CardContent className="flex flex-col items-center py-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <SearchX className="h-10 w-10 text-amber-400" strokeWidth={1.5} />
        </div>
        <p className="text-center text-lg font-medium text-foreground">No matching outfits found</p>
        <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
          Your wardrobe doesn't have enough items for this occasion. Try adding more clothes or adjusting your criteria.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="rounded-xl bg-transparent" asChild>
            <Link href="/wardrobe">Add Clothes</Link>
          </Button>
          <Button variant="outline" className="rounded-xl bg-transparent" asChild>
            <Link href="/shop">Shop Suggestions</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

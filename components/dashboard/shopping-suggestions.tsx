import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const products = [
  {
    id: "1",
    name: "Classic Trench Coat",
    image: "/beige-trench-coat.png",
    reason: "Why it's recommended: Complements your formal wear, your wardrobe essential.",
  },
  {
    id: "2",
    name: "Minimalist White Sneakers",
    image: "/white-minimalist-sneakers.png",
    reason: "Why it's recommended: Pairs well with casual tops, year-over-year must-have.",
  },
]

export function ShoppingSuggestions() {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Shopping Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-xl bg-slate-50/50">
            <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-contain p-4"
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-foreground">{product.name}</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{product.reason}</p>
              <Button
                size="sm"
                className="mt-3 w-full rounded-lg bg-teal-600 text-xs font-medium text-white hover:bg-teal-700"
              >
                Buy Now
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

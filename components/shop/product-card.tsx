import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export interface ProductData {
  id: string
  name: string
  image: string
  price: string
  reason: string
  category: string
  isRecommended?: boolean
}

interface ProductCardProps {
  product: ProductData
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl border-border/50 transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
        {product.isRecommended && (
          <Badge className="absolute left-3 top-3 z-10 rounded-full bg-teal-500 text-xs font-medium text-white">
            AI Pick
          </Badge>
        )}
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-contain p-6 transition-transform group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold text-foreground">{product.name}</h3>
          <span className="text-sm font-medium text-foreground">{product.price}</span>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{product.reason}</p>

        <Button className="w-full gap-2 rounded-xl bg-black text-sm font-medium text-white hover:bg-black/90">
          Buy Now
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

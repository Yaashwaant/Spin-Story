import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot } from "lucide-react"

export function AISuggestionPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,hsl(220_90%_56%/0.08),hsl(260_90%_56%/0.08))] p-[1px] shadow-lg shadow-slate-900/10">
      <Card className="rounded-3xl border-0 bg-slate-950 text-slate-50">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">AI suggested outfit</p>
            <CardTitle className="mt-1 text-base font-medium text-slate-50">You haven&rsquo;t asked yet</CardTitle>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200">
            AI
          </span>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 pb-6 pt-2">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/40">
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,hsl(220_90%_60%/0.28),transparent_55%)]" />
            <Bot className="relative h-8 w-8 text-slate-100" strokeWidth={1.2} />
          </div>
          <p className="text-center text-sm text-slate-200">
            {"Tell me where you\u2019re going \u2014 I\u2019ll style you."}
          </p>
        </CardContent>
      </Card>
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-indigo-400/0 via-indigo-400/70 to-indigo-400/0 opacity-80" />
    </div>
  )
}

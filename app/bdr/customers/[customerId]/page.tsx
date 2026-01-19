import { BdrNavbar } from "@/components/layout/bdr-navbar"
import { CustomerChatPanel } from "@/components/bdr/customer-chat-panel"

interface BdrCustomerPageProps {
  params: Promise<{
    customerId: string
  }>
  searchParams: Promise<{
    name?: string
    profile?: string
    preferences?: string
    wardrobeUploaded?: string
    outfitPlanCount?: string
  }>
}

export default async function BdrCustomerPage({ params, searchParams }: BdrCustomerPageProps) {
  const { customerId } = await params
  const resolvedSearchParams = await searchParams
  
  // Debug logging
  console.log("BdrCustomerPage - customerId:", customerId)
  console.log("BdrCustomerPage - searchParams:", resolvedSearchParams)
  const customerName = resolvedSearchParams.name
  
  let customerProfile = null
  let customerPreferences = null
  let wardrobeUploaded = false
  let outfitPlanCount = 0

  try {
    customerProfile = resolvedSearchParams.profile ? JSON.parse(resolvedSearchParams.profile) : null
  } catch (error) {
    console.error("Invalid profile parameter:", error)
  }
  
  try {
    customerPreferences = resolvedSearchParams.preferences ? JSON.parse(resolvedSearchParams.preferences) : null
  } catch (error) {
    console.error("Invalid preferences parameter:", error)
  }
  
  try {
    wardrobeUploaded = resolvedSearchParams.wardrobeUploaded === 'true'
  } catch (error) {
    console.error("Invalid wardrobeUploaded parameter:", error)
  }
  
  try {
    outfitPlanCount = resolvedSearchParams.outfitPlanCount ? parseInt(resolvedSearchParams.outfitPlanCount, 10) : 0
  } catch (error) {
    console.error("Invalid outfitPlanCount parameter:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <BdrNavbar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            BDR workspace
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {customerName ? `Assistant for ${customerName}` : "Customer assistant"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat with the AI stylist and generate personalized outfit plans for this customer.
          </p>
        </div>
        <CustomerChatPanel 
          customerId={customerId} 
          customerName={customerName}
          customerProfile={customerProfile}
          customerPreferences={customerPreferences}
          wardrobeUploaded={wardrobeUploaded}
          outfitPlanCount={outfitPlanCount}
        />
      </main>
    </div>
  )
}


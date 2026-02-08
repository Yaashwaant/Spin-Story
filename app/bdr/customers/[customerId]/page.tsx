import { BdrNavbar } from "@/components/layout/bdr-navbar"
import { CustomerChatPanel } from "@/components/bdr/customer-chat-panel"

interface BdrCustomerPageProps {
  params: Promise<{
    customerId: string
  }>
}

async function getCustomer(customerId: string) {
  try {
    const { adminDb } = await import("@/lib/firebase-admin")
    
    const customerDoc = await adminDb.collection("users").doc(customerId).get()
    
    if (!customerDoc.exists) {
      return null
    }

    const data = customerDoc.data() as {
      name?: string
      fullName?: string
      contactNumber?: string
      phoneNumber?: string
      wardrobeUploaded?: boolean
      outfitPlanCount?: number
      profile?: any
      preferences?: any
      createdAt?: unknown
      updatedAt?: unknown
    }

    let customerName = data.name || data.fullName || ""
    
    if (!customerName || customerName === "Unknown user") {
      const contact = data.contactNumber || data.phoneNumber || ""
      if (contact) {
        customerName = `Customer ${contact.slice(-4)}`
      } else {
        customerName = `Customer ${customerId.slice(-4)}`
      }
    }

    return {
      id: customerId,
      name: customerName,
      contactNumber: data.contactNumber || data.phoneNumber || "",
      wardrobeUploaded: data.wardrobeUploaded ?? false,
      outfitPlanCount: data.outfitPlanCount ?? 0,
      profile: data.profile,
      preferences: data.preferences,
    }
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

export default async function BdrCustomerPage({ params }: BdrCustomerPageProps) {
  const { customerId } = await params
  const customer = await getCustomer(customerId)
  
  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <BdrNavbar />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Customer Not Found</h1>
            <p className="text-muted-foreground">The customer you're looking for could not be found.</p>
          </div>
        </main>
      </div>
    )
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
            {customer.name ? `Assistant for ${customer.name}` : "Customer assistant"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat with the AI stylist and generate personalized outfit plans for this customer.
          </p>
        </div>
        <CustomerChatPanel 
          customerId={customerId} 
          customerName={customer.name}
          customerProfile={customer.profile}
          customerPreferences={customer.preferences}
          wardrobeUploaded={customer.wardrobeUploaded}
          outfitPlanCount={customer.outfitPlanCount}
        />
      </main>
    </div>
  )
}

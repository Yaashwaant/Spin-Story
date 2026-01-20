"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BdrNavbar } from "@/components/layout/bdr-navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileModal } from "@/components/bdr/profile-modal"
import { CustomerUploadModal } from "@/components/bdr/customer-upload-modal"
import { Plus } from "lucide-react"

interface BdrCustomerSummary {
  id: string
  name: string
  contactNumber: string
  wardrobeUploaded: boolean
  outfitPlanCount: number
  createdAt: string
  updatedAt: string
  profile?: any
  preferences?: any
}

export default function BdrDashboardPage() {
  const [customers, setCustomers] = useState<BdrCustomerSummary[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<BdrCustomerSummary | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedUploadCustomer, setSelectedUploadCustomer] = useState<BdrCustomerSummary | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/bdr/customers")
        if (!res.ok) {
          setCustomers([])
          return
        }
        const data = (await res.json()) as { customers: BdrCustomerSummary[] }
        setCustomers(data.customers)
      } catch {
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <BdrNavbar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            BDR workspace
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See customer status and open the assistant to plan outfits for them.
          </p>
        </div>
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="text-sm font-semibold">Customer list</CardTitle>
            <CardDescription className="text-xs">
              Customer details including ID, contact, wardrobe usage, outfit plans, and creation date.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-border/40 px-4 py-3">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-8 w-24 rounded-2xl" />
                  </div>
                </div>
                <div className="rounded-2xl border border-border/40 px-4 py-3">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-8 w-24 rounded-2xl" />
                  </div>
                </div>
              </div>
            )}
            {!loading && customers && customers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No customers are available yet. When customers are added in the backend, they appear here.
              </p>
            )}
            {!loading && customers && customers.length > 0 && (
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-2xl border border-border/40 px-4 py-3"
                  >
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-6 sm:items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="text-sm font-medium text-foreground truncate">{customer.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm font-medium text-foreground">{customer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="text-sm text-muted-foreground">{customer.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Wardrobe</p>
                        {customer.wardrobeUploaded ? (
                          <Badge variant="outline" className="border-emerald-500/60 text-emerald-700">
                            Used
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-400/60 text-slate-700">
                            Not used
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Outfit Plans</p>
                        <p className="text-sm text-muted-foreground">{customer.outfitPlanCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 sm:mt-0 sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-2xl"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setProfileOpen(true)
                        }}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-2xl border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedUploadCustomer(customer)
                          setUploadModalOpen(true)
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Upload Clothes
                      </Button>
                      <Button asChild className="rounded-2xl" size="sm">
                        <Link
                          href={{
                            pathname: `/bdr/customers/${customer.id}`,
                            query: { 
                              name: customer.name,
                              profile: JSON.stringify(customer.profile),
                              preferences: JSON.stringify(customer.preferences),
                              wardrobeUploaded: customer.wardrobeUploaded,
                              outfitPlanCount: customer.outfitPlanCount
                            },
                          }}
                        >
                          Enable Chatbot
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      {selectedCustomer && (
        <ProfileModal
          open={profileOpen}
          onOpenChange={setProfileOpen}
          customer={selectedCustomer}
        />
      )}
      {selectedUploadCustomer && (
        <CustomerUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          customerId={selectedUploadCustomer.id}
          customerName={selectedUploadCustomer.name}
          onUploadComplete={() => {
            // Refresh customer list after successful upload
            const load = async () => {
              try {
                const res = await fetch("/api/bdr/customers")
                if (res.ok) {
                  const data = (await res.json()) as { customers: BdrCustomerSummary[] }
                  setCustomers(data.customers)
                }
              } catch (error) {
                console.error("Error refreshing customers:", error)
              }
            }
            load()
          }}
        />
      )}
    </div>
  )
}
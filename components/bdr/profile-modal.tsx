"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: {
    id: string
    name: string
    contactNumber: string
    profile?: any
    preferences?: any
  }
}

export function ProfileModal({ open, onOpenChange, customer }: ProfileModalProps) {
  const profile = customer.profile
  const preferences = customer.preferences

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Customer Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Full onboarding details for {customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Basic Information</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{customer.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">{customer.contactNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID</span>
                <span className="font-medium text-xs">{customer.id}</span>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          {profile && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Profile Details</h3>
              <div className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium capitalize">{profile.height}</span>
                </div>
                
                {/* Physique - from aiExtractedTraits or profile */}
                {(profile.aiExtractedTraits?.physique || profile.physique) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Physique</span>
                    <span className="font-medium capitalize">
                      {profile.aiExtractedTraits?.physique || profile.physique}
                    </span>
                  </div>
                )}
                
                {/* Skin Tone - from aiExtractedTraits or profile */}
                {(profile.aiExtractedTraits?.skinTone || profile.skinTone) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skin Tone</span>
                    <span className="font-medium capitalize">
                      {profile.aiExtractedTraits?.skinTone || profile.skinTone}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hair Color</span>
                  <span className="font-medium">{profile.hairColor}</span>
                </div>
                
                {/* Fit Preference - handle both array and string */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fit Preference</span>
                  <span className="font-medium capitalize">
                    {Array.isArray(profile.fitPreference) 
                      ? profile.fitPreference.join(', ') 
                      : profile.fitPreference}
                  </span>
                </div>
                
                {/* Color Comfort - from aiExtractedTraits or profile */}
                {(profile.aiExtractedTraits?.colorComfort || profile.colorComfort) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Color Comfort</span>
                    <span className="font-medium capitalize">
                      {profile.aiExtractedTraits?.colorComfort || profile.colorComfort}
                    </span>
                  </div>
                )}
                
                {/* Age */}
                {profile.age && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">{profile.age}</span>
                  </div>
                )}
                
                {/* Gender */}
                {profile.gender && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium capitalize">{profile.gender}</span>
                  </div>
                )}
                
                {/* Weight */}
                {profile.weight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">{profile.weight} kg</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dressing Purpose</span>
                  <span className="font-medium capitalize">{profile.dressingPurpose}</span>
                </div>
              </div>

              {/* Wears Most */}
              {profile.wearsMost && profile.wearsMost.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-1">Wears Most</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.wearsMost.map((item: string) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Avoids */}
              {profile.avoids && profile.avoids.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-1">Avoids</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.avoids.map((item: string) => (
                      <Badge key={item} variant="destructive" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Extracted Traits */}
              {profile.aiExtractedTraits && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">AI Extracted Traits</h4>
                  <div className="space-y-2">
                    {profile.aiExtractedTraits.physique && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Physique</span>
                        <span className="font-medium capitalize">{profile.aiExtractedTraits.physique}</span>
                      </div>
                    )}
                    {profile.aiExtractedTraits.skinTone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Skin Tone</span>
                        <span className="font-medium capitalize">{profile.aiExtractedTraits.skinTone}</span>
                      </div>
                    )}
                    {profile.aiExtractedTraits.personalityVibe && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Personality Vibe</span>
                        <span className="font-medium capitalize">{profile.aiExtractedTraits.personalityVibe}</span>
                      </div>
                    )}
                    {profile.aiExtractedTraits.styleEssence && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Style Essence</span>
                        <span className="font-medium capitalize">{profile.aiExtractedTraits.styleEssence}</span>
                      </div>
                    )}
                    {profile.aiExtractedTraits.personalityVibe && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Personality Vibe</span>
                        <span className="font-medium capitalize">{profile.aiExtractedTraits.personalityVibe}</span>
                      </div>
                    )}
                    {profile.aiExtractedTraits.colorComfort && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">AI Color Comfort</span>
                        <span className="font-medium capitalize">{profile.aiExtractedTraits.colorComfort}</span>
                      </div>
                    )}
                    {profile.aiExtractedTraits.fitPreference && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">AI Fit Preference</span>
                        <span className="font-medium capitalize">{profile.aiExtractedTraits.fitPreference}</span>
                      </div>
                    )}
                    {profile.aiExtractedTraits.additionalNotes && (
                      <div className="mt-2">
                        <span className="text-muted-foreground text-sm">Additional Notes</span>
                        <p className="text-sm font-medium mt-1">{profile.aiExtractedTraits.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Section */}
          {preferences && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Preferences</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget Range</span>
                  <span className="font-medium">
                    {preferences.currency} {preferences.budgetMin} - {preferences.budgetMax}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{preferences.currency}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
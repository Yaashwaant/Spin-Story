"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth/auth-provider"
import { User, Mail, Phone, Calendar, Edit3, Save, X, Settings, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [basicFormData, setBasicFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  })
  const [profileFormData, setProfileFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "",
    hairColor: "",
    wearsMost: [] as string[],
    fitPreference: [] as string[],
    colorComfort: "",
    avoids: "",
    dressingPurpose: "",
    physique: "",
    skinTone: "",
  })
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const wearsMostOptions = ["Tops", "Bottoms", "Ethnic", "Western", "Sportswear"]
  const fitPreferenceOptions = ["slim", "regular", "loose"]
  const colorComfortOptions = ["neutral", "pastel", "bold"]
  const dressingPurposeOptions = ["work", "casual", "party", "travel", "wedding"]

  useEffect(() => {
    if (user) {
      setBasicFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      })

      // Set profile data from user.profile
      if (user.profile) {
        setProfileFormData({
          height: user.profile.height?.toString() || "",
          weight: user.profile.weight?.toString() || "",
          age: user.profile.age?.toString() || "",
          gender: user.profile.gender || "",
          hairColor: user.profile.hairColor || "",
          wearsMost: user.profile.wearsMost || [],
          fitPreference: user.profile.fitPreference || [],
          colorComfort: user.profile.colorComfort || "",
          avoids: user.profile.avoids?.join(", ") || "",
          dressingPurpose: user.profile.dressingPurpose || "",
          physique: user.profile.physique || "",
          skinTone: user.profile.skinTone || "",
        })
      }
    }
  }, [user])

  const handleBasicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBasicFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleWearsMostChange = (item: string) => {
    setProfileFormData(prev => ({
      ...prev,
      wearsMost: prev.wearsMost.includes(item)
        ? prev.wearsMost.filter(i => i !== item)
        : [...prev.wearsMost, item]
    }))
  }

  const handleFitPreferenceChange = (item: string) => {
    setProfileFormData(prev => ({
      ...prev,
      fitPreference: prev.fitPreference.includes(item)
        ? prev.fitPreference.filter(i => i !== item)
        : [...prev.fitPreference, item]
    }))
  }

  const handleBasicSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(basicFormData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      setIsEditing(false)
      // Refresh user data
      window.location.reload()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSave = async () => {
    setIsLoading(true)
    try {
      const profileData = {
        ...profileFormData,
        height: profileFormData.height ? Number(profileFormData.height) : undefined,
        weight: profileFormData.weight ? Number(profileFormData.weight) : undefined,
        age: profileFormData.age ? Number(profileFormData.age) : undefined,
        avoids: profileFormData.avoids ? profileFormData.avoids.split(",").map(s => s.trim()) : [],
      }

      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ profile: profileData }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile features")
      }

      setIsEditing(false)
      // Refresh user data
      window.location.reload()
    } catch (error) {
      console.error("Error updating profile features:", error)
      alert("Failed to update profile features. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      alert("New passwords do not match")
      return
    }

    setPasswordLoading(true)
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to change password")
      }

      alert("Password changed successfully!")
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      alert(error instanceof Error ? error.message : "Failed to change password. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    if (user) {
      setBasicFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      })

      if (user.profile) {
        setProfileFormData({
          height: user.profile.height?.toString() || "",
          weight: user.profile.weight?.toString() || "",
          age: user.profile.age?.toString() || "",
          gender: user.profile.gender || "",
          hairColor: user.profile.hairColor || "",
          wearsMost: user.profile.wearsMost || [],
          fitPreference: user.profile.fitPreference || [],
          colorComfort: user.profile.colorComfort || "",
          avoids: user.profile.avoids?.join(", ") || "",
          dressingPurpose: user.profile.dressingPurpose || "",
          physique: user.profile.physique || "",
          skinTone: user.profile.skinTone || "",
        })
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your account information and profile features</p>
          </div>

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="features">Profile Features</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Basic Information</span>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.profile?.facePhotoUrl} alt={user.fullName} />
                      <AvatarFallback className="text-lg">{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  {/* Basic Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="fullName"
                            name="fullName"
                            value={basicFormData.fullName}
                            onChange={handleBasicInputChange}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={basicFormData.email}
                            onChange={handleBasicInputChange}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={basicFormData.phoneNumber}
                            onChange={handleBasicInputChange}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Member Since</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={new Date().toLocaleDateString()}
                            disabled
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleBasicSave}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Features Tab */}
            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Profile Features</span>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Physical Characteristics */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Physical Characteristics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          value={profileFormData.height}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          placeholder="e.g. 175"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          value={profileFormData.weight}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          placeholder="e.g. 70"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={profileFormData.age}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          placeholder="e.g. 22"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <RadioGroup
                          value={profileFormData.gender}
                          onValueChange={(value) => setProfileFormData(prev => ({ ...prev, gender: value }))}
                          disabled={!isEditing}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hairColor">Hair Color</Label>
                        <Input
                          id="hairColor"
                          name="hairColor"
                          value={profileFormData.hairColor}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          placeholder="e.g. Black, Brown, Blonde"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="physique">Physique</Label>
                        <Input
                          id="physique"
                          name="physique"
                          value={profileFormData.physique}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          placeholder="e.g. balanced proportions"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skinTone">Skin Tone</Label>
                        <Input
                          id="skinTone"
                          name="skinTone"
                          value={profileFormData.skinTone}
                          onChange={handleProfileInputChange}
                          disabled={!isEditing}
                          placeholder="e.g. warm undertones"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Style Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Style Preferences</h4>
                    
                    {/* Wears Most */}
                    <div className="space-y-2">
                      <Label>What do you wear most? (multi-select)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {wearsMostOptions.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={item}
                              checked={profileFormData.wearsMost.includes(item)}
                              onCheckedChange={() => handleWearsMostChange(item)}
                              disabled={!isEditing}
                            />
                            <Label htmlFor={item} className="cursor-pointer">{item}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fit Preference */}
                    <div className="space-y-2">
                      <Label>Fit Preference (multi-select)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {fitPreferenceOptions.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={item}
                              checked={profileFormData.fitPreference.includes(item)}
                              onCheckedChange={() => handleFitPreferenceChange(item)}
                              disabled={!isEditing}
                            />
                            <Label htmlFor={item} className="cursor-pointer capitalize">{item}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Comfort */}
                    <div className="space-y-2">
                      <Label>Color Comfort Level</Label>
                      <RadioGroup
                        value={profileFormData.colorComfort}
                        onValueChange={(value) => setProfileFormData(prev => ({ ...prev, colorComfort: value }))}
                        disabled={!isEditing}
                      >
                        {colorComfortOptions.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <RadioGroupItem value={item} id={item} />
                            <Label htmlFor={item} className="capitalize cursor-pointer">{item}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Dressing Purpose */}
                    <div className="space-y-2">
                      <Label htmlFor="dressingPurpose">Dressing Purpose</Label>
                      <select
                        id="dressingPurpose"
                        value={profileFormData.dressingPurpose}
                        onChange={(e) => setProfileFormData(prev => ({ ...prev, dressingPurpose: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">Select purpose</option>
                        {dressingPurposeOptions.map((item) => (
                          <option key={item} value={item} className="capitalize">{item}</option>
                        ))}
                      </select>
                    </div>

                    {/* Avoids */}
                    <div className="space-y-2">
                      <Label htmlFor="avoids">Things you avoid wearing</Label>
                      <Input
                        id="avoids"
                        name="avoids"
                        value={profileFormData.avoids}
                        onChange={handleProfileInputChange}
                        disabled={!isEditing}
                        placeholder="e.g. sleeveless, bright colors, denim (comma separated)"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleProfileSave}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Features
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Change Password Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordFormData.currentPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordFormData.newPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordFormData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button
                        onClick={handlePasswordChange}
                        disabled={passwordLoading}
                        className="w-full"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Changing Password...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
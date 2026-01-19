"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { uploadProfilePhoto } from "@/lib/upload-profile-photo";
import { profileSchema, preferencesSchema, type Profile, type Preferences } from "@/models/user";

const wearsMostOptions = ["Tops", "Bottoms", "Ethnic", "Western", "Sportswear"];
const dressingPurposeOptions = ["work", "casual", "party", "travel", "wedding"];
const colorComfortOptions = ["neutral", "pastel", "bold"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [preferences, setPreferences] = useState<Partial<Preferences>>({ currency: "INR" });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle redirect logic properly
  useEffect(() => {
    if (user?.onboarded && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
  }, [user?.onboarded, router, isRedirecting]);

  // Don't render anything if user is already onboarded or redirecting
  if (user?.onboarded || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    if (!profile.height) newErrors.height = "Height is required";
    if (!profile.physique) newErrors.physique = "Physique is required";
    if (!profile.skinTone) newErrors.skinTone = "Skin tone is required";
    if (!profile.hairColor) newErrors.hairColor = "Hair color is required";
    if (!profile.wearsMost || profile.wearsMost.length === 0) newErrors.wearsMost = "Please select at least one option";
    if (!profile.fitPreference) newErrors.fitPreference = "Fit preference is required";
    if (!profile.colorComfort) newErrors.colorComfort = "Color comfort is required";
    if (!profile.dressingPurpose) newErrors.dressingPurpose = "Dressing purpose is required";
    if (!preferences.budgetMin || !preferences.budgetMax) newErrors.budget = "Budget range is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        return;
      }
      
      setSubmitting(true);
      
      // Clean up the data - remove undefined values
      const cleanProfile = Object.fromEntries(
        Object.entries(profile).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      
      const cleanPreferences = Object.fromEntries(
        Object.entries(preferences).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );

      // Validate the cleaned data
      const parsedProfile = profileSchema.parse(cleanProfile);
      const parsedPrefs = preferencesSchema.parse(cleanPreferences);

      // Handle file upload if provided
      if (file) {
        const url = await uploadProfilePhoto(file);
        parsedProfile.facePhotoUrl = url;
      }

      // Submit to API
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          profile: parsedProfile, 
          preferences: parsedPrefs 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      // Refresh user data and redirect to dashboard
      await refreshUser();
      setIsRedirecting(true);
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-3xl">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Complete Your Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tell us about yourself so we can provide personalized outfit recommendations.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Height */}
            <div>
              <Label>Height</Label>
              <RadioGroup
                value={profile.height || ""}
                onValueChange={(v) => {
                  setProfile({ ...profile, height: v as any });
                  setErrors({ ...errors, height: "" });
                }}
                className="grid grid-cols-3 gap-2 mt-2"
              >
                {["short", "average", "tall"].map((h) => (
                  <div key={h} className="flex items-center space-x-2">
                    <RadioGroupItem value={h} id={h} />
                    <Label htmlFor={h} className="capitalize cursor-pointer">{h}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.height && <p className="text-xs text-destructive mt-1">{errors.height}</p>}
            </div>

            {/* Physique */}
            <div>
              <Label>Physique</Label>
              <RadioGroup
                value={profile.physique || ""}
                onValueChange={(v) => {
                  setProfile({ ...profile, physique: v as any });
                  setErrors({ ...errors, physique: "" });
                }}
                className="grid grid-cols-3 gap-2 mt-2"
              >
                {["slim", "average", "athletic", "broad", "heavy"].map((p) => (
                  <div key={p} className="flex items-center space-x-2">
                    <RadioGroupItem value={p} id={p} />
                    <Label htmlFor={p} className="capitalize cursor-pointer">{p}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.physique && <p className="text-xs text-destructive mt-1">{errors.physique}</p>}
            </div>

            {/* Skin Tone */}
            <div>
              <Label>Skin Tone</Label>
              <RadioGroup
                value={profile.skinTone || ""}
                onValueChange={(v) => {
                  setProfile({ ...profile, skinTone: v as any });
                  setErrors({ ...errors, skinTone: "" });
                }}
                className="grid grid-cols-4 gap-2 mt-2"
              >
                {["fair", "medium", "wheatish", "dark"].map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <RadioGroupItem value={s} id={s} />
                    <Label htmlFor={s} className="capitalize cursor-pointer">{s}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.skinTone && <p className="text-xs text-destructive mt-1">{errors.skinTone}</p>}
            </div>

            {/* Hair Color */}
            <div>
              <Label>Hair Color</Label>
              <Textarea
                placeholder="e.g. Black, Brown, Blonde"
                value={profile.hairColor || ""}
                onChange={(e) => {
                  setProfile({ ...profile, hairColor: e.target.value });
                  setErrors({ ...errors, hairColor: "" });
                }}
                className="mt-2"
              />
              {errors.hairColor && <p className="text-xs text-destructive mt-1">{errors.hairColor}</p>}
            </div>

            {/* Wears Most */}
            <div>
              <Label>What do you wear most? (multi-select)</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {wearsMostOptions.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      checked={profile.wearsMost?.includes(item) || false}
                      onCheckedChange={(checked) => {
                        const list = profile.wearsMost || [];
                        const newList = checked
                          ? [...list, item]
                          : list.filter((i) => i !== item);
                        setProfile({ ...profile, wearsMost: newList });
                        setErrors({ ...errors, wearsMost: "" });
                      }}
                    />
                    <Label className="cursor-pointer">{item}</Label>
                  </div>
                ))}
              </div>
              {errors.wearsMost && <p className="text-xs text-destructive mt-1">{errors.wearsMost}</p>}
            </div>

            {/* Fit Preference */}
            <div>
              <Label>Fit Preference</Label>
              <RadioGroup
                value={profile.fitPreference || ""}
                onValueChange={(v) => {
                  setProfile({ ...profile, fitPreference: v as any });
                  setErrors({ ...errors, fitPreference: "" });
                }}
                className="grid grid-cols-3 gap-2 mt-2"
              >
                {["slim", "regular", "loose"].map((f) => (
                  <div key={f} className="flex items-center space-x-2">
                    <RadioGroupItem value={f} id={f} />
                    <Label htmlFor={f} className="capitalize cursor-pointer">{f}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.fitPreference && <p className="text-xs text-destructive mt-1">{errors.fitPreference}</p>}
            </div>

            {/* Color Comfort */}
            <div>
              <Label>Color Comfort Level</Label>
              <RadioGroup
                value={profile.colorComfort || ""}
                onValueChange={(v) => {
                  setProfile({ ...profile, colorComfort: v as any });
                  setErrors({ ...errors, colorComfort: "" });
                }}
                className="grid grid-cols-3 gap-2 mt-2"
              >
                {colorComfortOptions.map((c) => (
                  <div key={c} className="flex items-center space-x-2">
                    <RadioGroupItem value={c} id={c} />
                    <Label htmlFor={c} className="capitalize cursor-pointer">{c}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.colorComfort && <p className="text-xs text-destructive mt-1">{errors.colorComfort}</p>}
            </div>

            {/* Dressing Purpose */}
            <div>
              <Label>Main Dressing Purpose</Label>
              <RadioGroup
                value={profile.dressingPurpose || ""}
                onValueChange={(v) => {
                  setProfile({ ...profile, dressingPurpose: v as any });
                  setErrors({ ...errors, dressingPurpose: "" });
                }}
                className="grid grid-cols-3 gap-2 mt-2"
              >
                {dressingPurposeOptions.map((p) => (
                  <div key={p} className="flex items-center space-x-2">
                    <RadioGroupItem value={p} id={p} />
                    <Label htmlFor={p} className="capitalize cursor-pointer">{p}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.dressingPurpose && <p className="text-xs text-destructive mt-1">{errors.dressingPurpose}</p>}
            </div>

            {/* Avoids */}
            <div>
              <Label>Things you avoid wearing</Label>
              <Textarea
                placeholder="e.g. sleeveless, bright colors, denim"
                value={profile.avoids?.join(", ") || ""}
                onChange={(e) =>
                  setProfile({ ...profile, avoids: e.target.value.split(",").map((s) => s.trim()) })
                }
                className="mt-2"
              />
            </div>

            {/* Budget */}
            <div>
              <Label>Budget Range (INR)</Label>
              <div className="flex gap-4 mt-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={preferences.budgetMin || ""}
                  onChange={(e) => {
                    setPreferences({ ...preferences, budgetMin: Number(e.target.value) });
                    setErrors({ ...errors, budget: "" });
                  }}
                  className="input border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={preferences.budgetMax || ""}
                  onChange={(e) => {
                    setPreferences({ ...preferences, budgetMax: Number(e.target.value) });
                    setErrors({ ...errors, budget: "" });
                  }}
                  className="input border rounded px-3 py-2"
                />
              </div>
              {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget}</p>}
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Profile Photo (optional)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-2"
              />
            </div>

            {/* Submit */}
            <Button onClick={handleSave} disabled={submitting} className="w-full rounded-2xl">
              {submitting ? "Saving..." : "Complete Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
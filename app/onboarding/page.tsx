"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { uploadProfilePhoto, compressImage } from "@/lib/upload-profile-photo";
import { profileSchema, preferencesSchema, type Profile, type Preferences } from "@/models/user";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const wearsMostOptions = ["Tops", "Bottoms", "Ethnic", "Western", "Sportswear"];
const dressingPurposeOptions = ["work", "casual", "party", "travel", "wedding"];
const colorComfortOptions = ["neutral", "pastel", "bold"];

export default function OnboardingPage() {
  const { user, refreshUser, isLoading } = useAuth();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [preferences, setPreferences] = useState<Partial<Preferences>>({ currency: "INR" });
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stylingAdvice, setStylingAdvice] = useState<string>("");
  const [analysisStatus, setAnalysisStatus] = useState<string>("");

  // Handle redirect logic properly
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.onboarded) {
      window.location.href = "/dashboard";
    }
  }, [user, isLoading]);

  // Don't render anything if loading, not authenticated, or already onboarded
  if (isLoading || !user || user?.onboarded) {
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
    if (!profile.weight) newErrors.weight = "Weight is required";
    if (!profile.hairColor) newErrors.hairColor = "Hair color is required";
    if (!profile.gender) newErrors.gender = "Gender is required";
    if (!profile.age) newErrors.age = "Age is required";
    if (profile.age && (profile.age < 13 || profile.age > 100)) newErrors.age = "Age must be between 13 and 100";
    if (!profile.wearsMost || profile.wearsMost.length === 0) newErrors.wearsMost = "Please select at least one option";
    if (!profile.fitPreference || profile.fitPreference.length === 0) newErrors.fitPreference = "Fit preference is required";
    if (!profile.colorComfort) newErrors.colorComfort = "Color comfort is required";
    if (!preferences.budgetMin || !preferences.budgetMax) newErrors.budget = "Budget range is required";
    
    if (!faceFile) newErrors.facePhoto = "Face photo is required for AI analysis";
    if (!bodyFile) newErrors.bodyPhoto = "Full body photo is required for AI analysis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // FileReader result includes "data:image/jpeg;base64," prefix which we want to keep
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async () => {
    try {
      // If styling advice is already displayed, just redirect to dashboard
      if (stylingAdvice) {
        window.location.href = "/dashboard";
        return;
      }
      
      // Validate form first
      if (!validateForm()) {
        return;
      }
      
      setSubmitting(true);
      setAnalysisStatus("Analyzing your photos... This may take up to 60 seconds.");

      // Analyze photos with AI
      let aiTraits = {};
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for analysis (backend has 60s)

        // Send files directly using FormData (no base64 conversion needed)
        const formData = new FormData();
        if (faceFile) {
          formData.append('facePhoto', faceFile);
        }
        if (bodyFile) {
          formData.append('fullBodyPhoto', bodyFile);
        }

        const aiResponse = await fetch("/api/ai/analyze-profile", {
          method: "POST",
          body: formData,
          signal: controller.signal
          // Note: Don't set Content-Type header for FormData - browser sets it automatically
        });
        
        clearTimeout(timeoutId);

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          
          if (aiData.success && aiData.traits) {
            aiTraits = aiData.traits;
            // Display styling advice if available
            if (aiData.traits.stylingAdvice) {
              setStylingAdvice(aiData.traits.stylingAdvice);
              setAnalysisStatus("Analysis complete! Your personalized styling advice is ready.");
              // Don't redirect immediately - let user see the advice
              setSubmitting(false);
              return;
            }
          } else if (aiData.error) {
            // Handle specific error messages from backend
            throw new Error(aiData.error);
          } else {
            throw new Error("AI analysis returned invalid data");
          }
        } else if (aiResponse.status === 408) {
          // Request timeout - analysis is still running
          throw new Error("Photo analysis is taking longer than expected. Please wait a moment and try refreshing the page if needed.");
        } else if (aiResponse.status === 503) {
          // Service unavailable - network/service issue
          throw new Error("Network connection issue. Please check your internet connection and try again.");
        } else {
          // Try to get error details from response
          const errorData = await aiResponse.json().catch(() => ({ error: "Analysis failed" }));
          throw new Error(errorData.details || errorData.error || "AI analysis failed");
        }
      } catch (aiError) {
        console.error("AI analysis failed or timed out:", aiError);
        const errorMessage = aiError instanceof Error ? aiError.message : "Failed to analyze photos";
        
        // Handle different types of errors with specific messages
        if (errorMessage.includes("timeout") || errorMessage.includes("AbortError") || errorMessage.includes("taking longer than expected")) {
          alert("Photo analysis is taking longer than expected.\n\nThis usually happens with:\n• Large image files (over 2MB)\n• Complex lighting conditions\n• Multiple people in the photo\n\nPlease try:\n• Uploading a smaller image\n• Using a clearer photo with better lighting\n• Uploading a different photo\n\nThe analysis may still be running - you can refresh the page to check if it's complete.");
        } else if (errorMessage.includes("Network error") || errorMessage.includes("fetch") || errorMessage.includes("Network connection")) {
          alert("Network connection issue. Please check your internet connection and try again.");
        } else if (errorMessage.includes("Unable to analyze photo")) {
          alert(errorMessage + "\n\nPlease upload a different and clear photo of yourself.");
        } else {
          alert("Failed to analyze photos. Please upload clearer photos and try again.");
        }
        
        setSubmitting(false);
        setAnalysisStatus(""); // Clear status on error
        return; // Stop execution, don't save profile
      }
      
      // Clean up the data - remove undefined values
      const cleanProfile = Object.fromEntries(
        Object.entries(profile).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      
      const cleanPreferences = Object.fromEntries(
        Object.entries(preferences).filter(([_, v]) => v !== undefined && v !== null && (v as any) !== '')
      );

      // Prepare final profile object - We DO NOT store the image URLs anymore as requested
      const finalProfile = {
        ...cleanProfile,
        aiExtractedTraits: aiTraits,
      };

      // Submit to API
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          profile: finalProfile, 
          preferences: cleanPreferences 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      // Refresh user data and redirect to dashboard
      await refreshUser();
      
      // Add a small delay to ensure auth context is properly updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use window.location for a complete page reload to ensure fresh data
      window.location.href = "/dashboard";
      
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
            <div className="grid grid-cols-2 gap-4">
              {/* Height */}
              <div>
                <Label>Height (cm)</Label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  min="50"
                  max="300"
                  value={profile.height || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setProfile({ ...profile, height: val });
                    setErrors({ ...errors, height: "" });
                  }}
                  className="mt-2 w-full border rounded px-3 py-2"
                />
                {errors.height && <p className="text-xs text-destructive mt-1">{errors.height}</p>}
              </div>

              {/* Weight */}
              <div>
                <Label>Weight (kg)</Label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  min="20"
                  max="300"
                  value={profile.weight || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setProfile({ ...profile, weight: val });
                    setErrors({ ...errors, weight: "" });
                  }}
                  className="mt-2 w-full border rounded px-3 py-2"
                />
                {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Age */}
               <div>
                <Label>Age</Label>
                <input
                  type="number"
                  placeholder="Age"
                  min="13"
                  max="100"
                  value={profile.age || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setProfile({ ...profile, age: val });
                    setErrors({ ...errors, age: "" });
                  }}
                  className="mt-2 w-full border rounded px-3 py-2"
                />
                {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div>
                <Label>Gender</Label>
                <RadioGroup
                  value={profile.gender || ""}
                  onValueChange={(v) => {
                    setProfile({ ...profile, gender: v as any });
                    setErrors({ ...errors, gender: "" });
                  }}
                  className="flex gap-4 mt-3"
                >
                  {["male", "female", "other"].map((g) => (
                    <div key={g} className="flex items-center space-x-2">
                      <RadioGroupItem value={g} id={g} />
                      <Label htmlFor={g} className="capitalize cursor-pointer">{g}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
              </div>
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

            {/* Fit Preference (Multi-select) */}
            <div>
              <Label>Fit Preference (multi-select)</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["slim", "regular", "loose"].map((f) => (
                  <div key={f} className="flex items-center space-x-2">
                    <Checkbox
                      checked={profile.fitPreference?.includes(f) || false}
                      onCheckedChange={(checked) => {
                        const list = profile.fitPreference || [];
                        const newList = checked
                          ? [...list, f]
                          : list.filter((i) => i !== f);
                        setProfile({ ...profile, fitPreference: newList });
                        setErrors({ ...errors, fitPreference: "" });
                      }}
                    />
                    <Label className="capitalize cursor-pointer">{f}</Label>
                  </div>
                ))}
              </div>
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

            {/* Photo Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-xl bg-slate-50">
              <div>
                <Label className="block mb-2 font-medium">Face Photo (Required)</Label>
                <p className="text-xs text-muted-foreground mb-3">Clear photo of your face for skin tone and features analysis.</p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFaceFile(e.target.files[0]);
                        setErrors({ ...errors, facePhoto: "" });
                      }
                    }}
                    className="w-full text-sm"
                  />
                  {faceFile && <span className="text-green-600 text-xs">✓ Selected</span>}
                </div>
                {errors.facePhoto && <p className="text-xs text-destructive mt-1">{errors.facePhoto}</p>}
              </div>

              <div>
                <Label className="block mb-2 font-medium">Full Body Photo (Required)</Label>
                <p className="text-xs text-muted-foreground mb-3">Full length photo to analyze body shape and proportions.</p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setBodyFile(e.target.files[0]);
                        setErrors({ ...errors, bodyPhoto: "" });
                      }
                    }}
                    className="w-full text-sm"
                  />
                  {bodyFile && <span className="text-green-600 text-xs">✓ Selected</span>}
                </div>
                {errors.bodyPhoto && <p className="text-xs text-destructive mt-1">{errors.bodyPhoto}</p>}
              </div>
              
              <div className="col-span-1 md:col-span-2 text-center text-xs text-blue-600 bg-blue-50 p-2 rounded">
                We use AI to analyze these photos to automatically determine your body type, skin tone, and style essence.
              </div>
            </div>

            {/* Display styling advice if available */}
            {stylingAdvice && (
              <div className="p-4 border rounded-xl bg-green-50">
                <h3 className="text-lg font-semibold mb-3 text-green-800">Your Personalized Styling Advice</h3>
                {analysisStatus && (
                  <div className="mb-3 p-2 bg-green-100 rounded-lg text-green-800 text-sm">
                    {analysisStatus}
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-green-900">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-3 last:mb-0 leading-relaxed text-green-900">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-green-800">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-1 mb-3 text-green-900">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-1 mb-3 text-green-900">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed text-green-900">{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-3 mt-4 text-green-900">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-2 mt-3 text-green-900">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold mb-2 mt-2 text-green-900">{children}</h3>
                      ),
                    }}
                  >
                    {stylingAdvice}
                  </ReactMarkdown>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  This advice has been saved to your profile and will be available on your dashboard.
                </p>
              </div>
            )}

            {/* Submit */}
            <Button onClick={handleSave} disabled={submitting} className="w-full rounded-2xl h-12 text-lg">
              {submitting ? (analysisStatus.includes("Analyzing") ? "Analyzing Photos..." : "Saving Profile...") : stylingAdvice ? "Continue to Dashboard" : "Complete Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
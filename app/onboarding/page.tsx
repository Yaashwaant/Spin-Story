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
import { uploadProfilePhoto, compressImage } from "@/lib/upload-profile-photo";
import { profileSchema, preferencesSchema, type Profile, type Preferences } from "@/models/user";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const wearsMostOptions = ["Tops", "Bottoms", "Ethnic", "Western", "Sportswear"];
const dressingPurposeOptions = ["work", "casual", "party", "travel", "wedding"];
const colorComfortOptions = ["neutral", "pastel", "bold"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser, isLoading, setUser } = useAuth();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [preferences, setPreferences] = useState<Partial<Preferences>>({ currency: "INR" });
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [stylingAdvice, setStylingAdvice] = useState<string>("");
  const [aiAnalysisSkipped, setAiAnalysisSkipped] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Handle redirect logic properly
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const sessionCompleted = sessionStorage.getItem('onboarding_completed');
    if (user.onboarded && !isRedirecting && !onboardingCompleted && !sessionCompleted) {
      setIsRedirecting(true);
      setOnboardingCompleted(true);
      sessionStorage.setItem('onboarding_completed', 'true');
      setTimeout(() => {
        router.push("/dashboard");
      }, 200);
    }

    // Cleanup session storage after successful redirect
    return () => {
      if (onboardingCompleted) {
        sessionStorage.removeItem('onboarding_completed');
      }
    };
  }, [user, isLoading, router, isRedirecting, onboardingCompleted]);

  // Don't render anything if loading, not authenticated, already onboarded or redirecting
  if (isLoading || !user || (user?.onboarded) || isRedirecting) {
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
      // If styling advice is already displayed, complete onboarding and redirect to dashboard
      if (stylingAdvice) {
        console.log("Onboarding - AI analysis successful, completing onboarding...");
        setSubmitting(true);
        
        try {
          // Call the completion endpoint to set onboarded: true
          const completeResponse = await fetch("/api/onboarding/complete", {
            method: "POST",
            credentials: "include",
          });
          
          console.log("Onboarding complete response status:", completeResponse.status);
          
          if (completeResponse.ok) {
            const completeData = await completeResponse.json();
            console.log("Onboarding completed successfully:", completeData);
            
            // Force refresh the token to get updated onboarded status
            const refreshResponse = await fetch("/api/auth/refresh-token", {
              method: "POST",
              credentials: "include",
            });
            
            if (refreshResponse.ok) {
              // Now fetch fresh user data with the new token
              const userResponse = await fetch("/api/auth/me?t=" + Date.now(), {
                credentials: "include",
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log("Fresh user data after completion:", userData.user);
                console.log("Fresh onboarded status after completion:", userData.user.onboarded);
                
                // Manually update the user state in auth context
                if (user) {
                  setUser({ ...user, ...userData.user });
                }
              }
            }
            
            setIsRedirecting(true);
            router.push("/dashboard");
          } else {
            throw new Error("Failed to complete onboarding");
          }
        } catch (error) {
          console.error("Error completing onboarding:", error);
          // Still redirect even if completion fails - user has seen the analysis
          setIsRedirecting(true);
          router.push("/dashboard");
        } finally {
          setSubmitting(false);
        }
        return;
      }
      
      // Validate form first
      if (!validateForm()) {
        return;
      }
      
      setSubmitting(true);

      // Analyze photos with AI
      let aiTraits = {};
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for analysis

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
            // If traits are empty, mark as skipped so we can show a gentle notice
            if (Object.keys(aiData.traits).length === 0) {
              setAiAnalysisSkipped(true);
            }
            // Display styling advice if available
            if (aiData.traits.stylingAdvice) {
              setStylingAdvice(aiData.traits.stylingAdvice);
              // Don't redirect immediately - let user see the advice
              setSubmitting(false);
              return;
            }
          } else {
            throw new Error("AI analysis returned invalid data");
          }
        } else {
          const errorData = await aiResponse.json().catch(() => ({ error: "Analysis failed" }));
          throw new Error(errorData.details || errorData.error || "AI analysis failed");
        }
      } catch (aiError) {
        console.error("AI analysis failed or timed out:", aiError);
        // Silently continue; we'll show a small notice on the page instead of blocking onboarding
        // No alert, no return
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

      console.log("Onboarding - save response status:", response.status);
      
      if (!response.ok) {
        throw new Error("Failed to save profile");
      }
      
      const saveData = await response.json();
      console.log("Onboarding - save response data:", saveData);
      console.log("Onboarding - profile saved successfully, onboarded should still be false");

      // Just update the user context with the new profile/preferences
      // but onboarded will still be false until user clicks "Continue to Dashboard"
      if (user) {
        setUser({ 
          ...user, 
          profile: finalProfile, 
          preferences: cleanPreferences 
        });
      }

      // Don't redirect yet - user needs to see the styling advice first
      // The button will change to "Continue to Dashboard" and handle completion
      
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
            {aiAnalysisSkipped && (
              <p className="text-sm text-muted-foreground text-center">
                We couldn’t analyze your photos this time, but you can still complete your profile and get styling advice later.
              </p>
            )}
            <Button onClick={handleSave} disabled={submitting} className="w-full rounded-2xl h-12 text-lg">
              {submitting ? "Analyzing & Saving Profile..." : stylingAdvice ? "Continue to Dashboard" : "Complete Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
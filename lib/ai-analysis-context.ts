// Helper functions to format AI analysis data for chat context

export interface AIAnalysisData {
  visualFramePresence?: "light" | "moderate" | "strong";
  shoulderBalance?: "narrow" | "balanced" | "broad";
  torsoToLegBalance?: "longer torso" | "balanced" | "longer legs";
  verticalEmphasis?: "low" | "moderate" | "strong";
  horizontalEmphasis?: "low" | "moderate" | "strong";
  silhouetteStructure?: "structured" | "moderate" | "relaxed";
  visualWeightDistribution?: "upper" | "midsection" | "lower" | "even";
  contrastLevel?: "low" | "medium" | "high";
  fitObservation?: "close-fitting" | "balanced" | "loose";
  skinTone?: {
    depth?: "very-light" | "light" | "medium" | "tan" | "deep";
    undertone?: "cool" | "warm" | "neutral" | "olive";
  };
  styleEssence?: "classic" | "minimal" | "modern" | "bold" | "relaxed";
  colorHarmony?: "neutral-dominant" | "warm-dominant" | "cool-dominant" | "mixed";
  stylingLevers?: {
    recommendedJacketLength?: "cropped" | "standard" | "elongated";
    recommendedTrouserRise?: "low" | "mid" | "high";
    lapelStrategy?: "narrow" | "medium" | "wide";
    taperStrategy?: "straight" | "moderate" | "aggressive";
    fabricWeightSuggestion?: "light" | "medium" | "heavy";
    colorContrastStrategy?: "low" | "medium" | "high";
  };
}

export function formatAIAnalysisForChat(aiData: AIAnalysisData): string {
  const parts: string[] = [];
  
  if (aiData.skinTone) {
    parts.push(`Skin tone: ${aiData.skinTone.depth} depth with ${aiData.skinTone.undertone} undertone`);
  }
  
  if (aiData.styleEssence) {
    parts.push(`Style essence: ${aiData.styleEssence}`);
  }
  
  if (aiData.colorHarmony) {
    parts.push(`Color harmony: ${aiData.colorHarmony}`);
  }
  
  if (aiData.visualFramePresence) {
    parts.push(`Visual frame presence: ${aiData.visualFramePresence}`);
  }
  
  if (aiData.shoulderBalance) {
    parts.push(`Shoulder balance: ${aiData.shoulderBalance}`);
  }
  
  if (aiData.torsoToLegBalance) {
    parts.push(`Torso to leg balance: ${aiData.torsoToLegBalance}`);
  }
  
  if (aiData.visualWeightDistribution) {
    parts.push(`Visual weight distribution: ${aiData.visualWeightDistribution}`);
  }
  
  if (aiData.stylingLevers) {
    const levers = aiData.stylingLevers;
    const leverDescriptions: string[] = [];
    
    if (levers.recommendedJacketLength) {
      leverDescriptions.push(`${levers.recommendedJacketLength} jacket length`);
    }
    if (levers.recommendedTrouserRise) {
      leverDescriptions.push(`${levers.recommendedTrouserRise} rise trousers`);
    }
    if (levers.lapelStrategy) {
      leverDescriptions.push(`${levers.lapelStrategy} lapels`);
    }
    if (levers.taperStrategy) {
      leverDescriptions.push(`${levers.taperStrategy} taper`);
    }
    if (levers.fabricWeightSuggestion) {
      leverDescriptions.push(`${levers.fabricWeightSuggestion} weight fabrics`);
    }
    if (levers.colorContrastStrategy) {
      leverDescriptions.push(`${levers.colorContrastStrategy} color contrast`);
    }
    
    if (leverDescriptions.length > 0) {
      parts.push(`Recommended styling: ${leverDescriptions.join(', ')}`);
    }
  }
  
  return parts.join('. ');
}

export function getAIAnalysisContext(profile: any): string {
  if (!profile?.aiExtractedTraits) {
    return "";
  }
  
  return formatAIAnalysisForChat(profile.aiExtractedTraits);
}
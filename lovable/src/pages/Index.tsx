import { useState } from 'react';
import StarryBackground from '@/components/StarryBackground';
import OutfitFinder from '@/components/OutfitFinder';
import WardrobeGrid from '@/components/WardrobeGrid';
import RecentOutfits from '@/components/RecentOutfits';
import SavedOutfits from '@/components/SavedOutfits';

const Index = () => {
  const handleGenerate = () => {
    // Generate outfit logic
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarryBackground />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">FOCUS</p>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, <span className="text-primary">Alex</span>
          </h1>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Outfit Finder */}
          <div className="lg:col-span-4">
            <OutfitFinder onGenerate={handleGenerate} />
          </div>

          {/* Middle Column - Wardrobe */}
          <div className="lg:col-span-4">
            <WardrobeGrid />
          </div>

          {/* Right Column - Outfits */}
          <div className="lg:col-span-4 space-y-4">
            <RecentOutfits />
            <SavedOutfits />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

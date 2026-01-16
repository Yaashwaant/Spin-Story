import { useState } from 'react';
import { Sparkles, SlidersHorizontal, Mic } from 'lucide-react';

const moods = ['Relaxed', 'Playful', 'Elegant', 'Confident'];
const seasons = [
  { name: 'Summer', icon: '☀️', color: 'bg-amber-400/20 text-amber-300' },
  { name: 'Autumn', icon: '🍂', color: 'bg-orange-500/20 text-orange-300' },
  { name: 'Winter', icon: '❄️', color: 'bg-blue-400/20 text-blue-300' },
  { name: 'Spring', icon: '🌸', color: 'bg-green-400/20 text-green-300' },
];

interface OutfitFinderProps {
  onGenerate: () => void;
}

const OutfitFinder = ({ onGenerate }: OutfitFinderProps) => {
  const [location, setLocation] = useState('');
  const [selectedMood, setSelectedMood] = useState('Playful');
  const [selectedSeason, setSelectedSeason] = useState('Autumn');

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Primary Action</p>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Find an Outfit</h2>
            <span className="ai-badge">AI</span>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors">
          <Sparkles className="w-5 h-5 text-primary" />
        </button>
      </div>

      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">Where are you going?</label>
        <input
          type="text"
          placeholder="Tell me where you're going — I'll style you."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input-styled"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Mood</label>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center hover:bg-secondary/60 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center hover:bg-secondary/60 transition-colors">
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`chip ${selectedMood === mood ? 'chip-active' : 'chip-default'}`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Season Focus</label>
        <div className="flex flex-wrap gap-2">
          {seasons.map((season) => (
            <button
              key={season.name}
              onClick={() => setSelectedSeason(season.name)}
              className={`season-chip ${
                selectedSeason === season.name
                  ? season.color + ' border border-current/30'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              <span>{season.icon}</span>
              {season.name}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onGenerate} className="btn-generate">
        Generate Outfit
      </button>
    </div>
  );
};

export default OutfitFinder;

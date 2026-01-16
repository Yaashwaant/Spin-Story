import { Heart } from 'lucide-react';

interface SavedOutfit {
  id: number;
  name: string;
  items: string[];
  likes: number;
}

const savedOutfits: SavedOutfit[] = [
  { id: 1, name: 'Date Night', items: ['👗', '👠', '👜'], likes: 24 },
  { id: 2, name: 'Office Look', items: ['👔', '👖', '👞'], likes: 18 },
  { id: 3, name: 'Weekend Vibes', items: ['👕', '🩳', '🩴'], likes: 32 },
];

const SavedOutfits = () => {
  return (
    <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground text-sm">Saved Outfits</h3>
        <Heart className="w-4 h-4 text-primary" />
      </div>
      <div className="space-y-2">
        {savedOutfits.map((outfit) => (
          <div 
            key={outfit.id} 
            className="flex items-center gap-3 bg-secondary/30 rounded-lg p-2 cursor-pointer hover:bg-secondary/50 transition-all duration-300"
          >
            <div className="flex -space-x-1">
              {outfit.items.map((item, index) => (
                <div 
                  key={index} 
                  className="w-7 h-7 bg-card-light rounded-full flex items-center justify-center text-sm border-2 border-card"
                >
                  {item}
                </div>
              ))}
            </div>
            <span className="text-xs text-foreground font-medium flex-1">{outfit.name}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Heart className="w-3 h-3 fill-primary/50 text-primary" />
              {outfit.likes}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedOutfits;

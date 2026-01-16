import { ChevronRight } from 'lucide-react';

interface Outfit {
  id: number;
  name: string;
  items: string[];
}

const recentOutfits: Outfit[] = [
  { id: 1, name: 'Outfit 1: Casual', items: ['🧥', '👖', '👟', '🕶️'] },
  { id: 2, name: 'Outfit 2: Evening', items: ['👔', '👖', '👞', '⌚'] },
  { id: 3, name: 'Outfit 3: Sport', items: ['👕', '🩳', '👟', '🧢'] },
];

const RecentOutfits = () => {
  return (
    <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <h3 className="font-semibold text-foreground mb-4">Recent Outfits</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recentOutfits.map((outfit) => (
          <div 
            key={outfit.id} 
            className="flex-shrink-0 bg-card-light rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex gap-2 mb-2">
              {outfit.items.map((item, index) => (
                <div 
                  key={index} 
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-card-light-foreground font-medium">{outfit.name}</p>
          </div>
        ))}
        <button className="flex-shrink-0 w-10 h-full min-h-[80px] bg-secondary/40 rounded-xl flex items-center justify-center hover:bg-secondary/60 transition-colors">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default RecentOutfits;

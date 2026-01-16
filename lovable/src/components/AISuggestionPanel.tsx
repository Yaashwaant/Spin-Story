import { Shirt } from 'lucide-react';

interface AISuggestionPanelProps {
  isGenerating: boolean;
}

const AISuggestionPanel = ({ isGenerating }: AISuggestionPanelProps) => {
  return (
    <div className="glass-card p-4 flex flex-col animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">AI Powered</p>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">AI Suggested Outfit</h2>
            <span className="ai-badge text-[10px] px-1.5 py-0.5">AI</span>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors">
          <Shirt className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className={`relative ${isGenerating ? 'float-animation' : ''}`}>
          <svg 
            viewBox="0 0 120 100" 
            className="w-24 h-20 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M60 5 Q60 15, 55 20 Q50 25, 55 30 Q60 35, 60 30" strokeLinecap="round" />
            <circle cx="60" cy="35" r="5" fill="currentColor" />
            <path d="M60 40 L10 70 Q5 72, 5 78 L5 85 Q5 90, 10 90 L110 90 Q115 90, 115 85 L115 78 Q115 72, 110 70 L60 40" strokeLinejoin="round" />
          </svg>
          
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground mt-3 text-xs">
          {isGenerating 
            ? "Creating your perfect outfit..." 
            : "Tell me where you're going — I'll style you."
          }
        </p>
      </div>
    </div>
  );
};

export default AISuggestionPanel;

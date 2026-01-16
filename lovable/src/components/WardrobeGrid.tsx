interface ClothingItem {
  id: number;
  name: string;
  category: string;
  season: string;
  price?: number;
  image: string;
}

const wardrobeItems: ClothingItem[] = [
  { id: 1, name: 'Jacket', category: 'Outerwear', season: '2 Season', image: '🧥' },
  { id: 2, name: 'Jacket', category: 'Outerwear', season: 'Summer', price: 99, image: '🧥' },
  { id: 3, name: 'Dress', category: 'Dresses', season: 'Summer', price: 89, image: '👗' },
  { id: 4, name: 'Footwear', category: 'Shoes', season: 'Summer', price: 173, image: '👢' },
  { id: 5, name: 'Footwear', category: 'Shoes', season: 'Winter', image: '👟' },
  { id: 6, name: 'Top', category: 'Tops', season: 'Winter', price: 89, image: '👕' },
];

const WardrobeGrid = () => {
  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {wardrobeItems.map((item) => (
        <div key={item.id} className="wardrobe-card group">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg mb-2 flex items-center justify-center text-4xl">
            {item.image}
          </div>
          <h3 className="font-medium text-card-light-foreground text-sm">{item.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">○ {item.season}</span>
            {item.price && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                ${item.price}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WardrobeGrid;

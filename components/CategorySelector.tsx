import { useState } from 'react';

interface CategorySelectorProps {
  onSelectCategory: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onSelectCategory 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'actors', label: 'Actors' },
    { id: 'musicians', label: 'Musicians' },
    { id: 'athletes', label: 'Athletes' },
    { id: 'influencers', label: 'Influencers' },
  ];
  
  const handleSelect = (category: string) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  return (
    <section className="my-8">
      <h2 className="text-xl font-bold mb-4">CHOOSE CATEGORY:</h2>
      <div className="flex flex-wrap gap-3 justify-center text-black">
        {categories.map(category => (
          <button 
            key={category.id}
            className={`px-5 py-2 rounded-lg transition-all ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => handleSelect(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </section>
  );
};
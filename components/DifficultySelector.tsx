import { useState } from 'react';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: string) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  onSelectDifficulty 
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('a-lister');
  
  const handleSelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    onSelectDifficulty(difficulty);
  };

  return (
    <section className="my-8">
      <h2 className="text-xl font-bold mb-4">SELECT DIFFICULTY:</h2>
      <div className="flex flex-wrap gap-4 justify-center text-black">
        <button 
          className={`px-6 py-3 rounded-lg transition-all ${
            selectedDifficulty === 'rising-star' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => handleSelect('rising-star')}
        >
          <span className="font-bold">Rising Star</span>
          <p className="text-sm mt-1">(easier)</p>
        </button>
        
        <button 
          className={`px-6 py-3 rounded-lg transition-all ${
            selectedDifficulty === 'a-lister' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => handleSelect('a-lister')}
        >
          <span className="font-bold">A-Lister</span>
          <p className="text-sm mt-1">(medium)</p>
        </button>
        
        <button 
          className={`px-6 py-3 rounded-lg transition-all ${
            selectedDifficulty === 'icon' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => handleSelect('icon')}
        >
          <span className="font-bold">Icon</span>
          <p className="text-sm mt-1">(hard)</p>
        </button>
      </div>
    </section>
  );
};
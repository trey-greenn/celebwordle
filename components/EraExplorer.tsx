import { useState } from 'react';

interface EraExplorerProps {
  onSelectEra: (era: string) => void;
}

export const EraExplorer: React.FC<EraExplorerProps> = ({ 
  onSelectEra 
}) => {
  const [selectedEra, setSelectedEra] = useState<string>('');
  
  const eras = [
    { id: '2000s', label: '2000s+' },
    { id: '90s', label: '90s' },
    { id: '80s', label: '80s' },
    { id: '70s', label: '70s' },
    { id: 'golden-age', label: 'Golden Age' },
  ];
  
  const handleSelect = (era: string) => {
    setSelectedEra(era);
    onSelectEra(era);
  };

  return (
    <section className="my-8">
      <h2 className="text-xl font-bold mb-4">EXPLORE BY ERA:</h2>
      <div className="flex flex-wrap gap-3 justify-center text-black">
        {eras.map(era => (
          <button 
            key={era.id}
            className={`px-5 py-2 rounded-lg transition-all ${
              selectedEra === era.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => handleSelect(era.id)}
          >
            {era.label}
          </button>
        ))}
      </div>
    </section>
  );
};
interface CategoryItem {
    id: string;
    name: string;
  }
  
  interface FeaturedCategoriesProps {
    categories: CategoryItem[];
    onSelectCategory: (categoryId: string) => void;
  }
  
  export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ 
    categories, 
    onSelectCategory 
  }) => {
    return (
      <section className="my-8">
        <h2 className="text-xl font-bold mb-4">FEATURED CATEGORIES</h2>
        <div className="flex flex-wrap gap-3 justify-center text-black">
          {categories.map(category => (
            <button 
              key={category.id}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>
    );
  };
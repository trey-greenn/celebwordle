import { useState, useEffect } from 'react';
import Head from 'next/head';
import SEO from '@/components/SEO';
import { DifficultySelector } from '@/components/DifficultySelector';
import { CategorySelector } from '@/components/CategorySelector';
import { EraExplorer } from '@/components/EraExplorer';
import { Leaderboard } from '@/components/Leaderboard';
import { FeaturedCategories } from '@/components/FeaturedCategories';
import Header from '@/components/Header';

// Celebrity interface based on CSV structure
interface Celebrity {
  name: string;
  profession: string;
  age: number;
  country: string;
  oscars: number;
  grammys: number;
}

// Game state interface
interface GameState {
  mysteryCeleb: Celebrity | null;
  guesses: Celebrity[];
  gameOver: boolean;
  won: boolean;
  gaveUp: boolean;
  loading: boolean;
  maxGuesses: number;
}

export default function Home() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCelebs, setFilteredCelebs] = useState<Celebrity[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    mysteryCeleb: null,
    guesses: [],
    gameOver: false,
    won: false,
    gaveUp: false,
    loading: true,
    maxGuesses: 8
  });

  // Initialize game on component mount
  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        // Fetch CSV data from public directory
        const response = await fetch('/celebwordle.csv');
        const csvText = await response.text();
        
        // Parse CSV into celebrity objects
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        // Map lines to celebrity objects
        const parsedCelebs: Celebrity[] = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.split(',');
          return {
            name: values[0],
            profession: values[1],
            age: parseInt(values[2], 10),
            country: values[3],
            oscars: parseInt(values[4], 10),
            grammys: parseInt(values[5], 10)
          };
        });
        
        setCelebrities(parsedCelebs);
        
        // Select a random celebrity as the mystery celebrity
        const randomIndex = Math.floor(Math.random() * parsedCelebs.length);
        setGameState(prev => ({
          ...prev,
          mysteryCeleb: parsedCelebs[randomIndex],
          loading: false
        }));
      } catch (error) {
        console.error('Error loading celebrity data:', error);
        setGameState(prev => ({
          ...prev,
          loading: false
        }));
      }
    };
    
    fetchCelebrities();
    
    // Check if user has played before
    const hasPlayed = localStorage.getItem('celebWordleHasPlayed');
    if (hasPlayed) {
      setShowInstructions(false);
    } else {
      localStorage.setItem('celebWordleHasPlayed', 'true');
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      const filtered = celebrities.filter(celeb => 
        celeb.name.toLowerCase().includes(term.toLowerCase()) &&
        !gameState.guesses.some(guess => guess.name === celeb.name)
      );
      setFilteredCelebs(filtered);
    } else {
      setFilteredCelebs([]);
    }
  };

  // Handle celebrity selection
  const selectCeleb = (celeb: Celebrity) => {
    setSearchTerm('');
    setFilteredCelebs([]);
    
    // Check if celebrity is already guessed
    if (gameState.guesses.some(guess => guess.name === celeb.name)) {
      return;
    }
    
    // Check if celebrity is the mystery celebrity
    const isCorrect = celeb.name === gameState.mysteryCeleb?.name;
    
    const newGuesses = [...gameState.guesses, celeb];
    
    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      gameOver: isCorrect || newGuesses.length >= prev.maxGuesses,
      won: isCorrect
    }));
  };

  // Handle give up
  const handleGiveUp = () => {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      gaveUp: true
    }));
  };

  // Handle new game
  const handleNewGame = () => {
    const randomIndex = Math.floor(Math.random() * celebrities.length);
    setGameState({
      mysteryCeleb: celebrities[randomIndex],
      guesses: [],
      gameOver: false,
      won: false,
      gaveUp: false,
      loading: false,
      maxGuesses: 8
    });
  };
  
  const [selectedDifficulty, setSelectedDifficulty] = useState('a-lister');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEra, setSelectedEra] = useState('');

  // Check if a property matches the mystery celebrity
  const isMatch = (guess: Celebrity, property: keyof Celebrity) => {
    if (!gameState.mysteryCeleb) return false;
    return guess[property] === gameState.mysteryCeleb[property];
  };

  // Get directional hint for numeric values
  const getDirectionalHint = (guess: Celebrity, property: 'age' | 'oscars' | 'grammys') => {
    if (!gameState.mysteryCeleb) return null;
    
    if (guess[property] === gameState.mysteryCeleb[property]) {
      return null;
    }
    
    if (guess[property] < gameState.mysteryCeleb[property]) {
      return <span className={`directionalHint higher`}>↑</span>;
    } else {
      return <span className={`directionalHint lower`}>↓</span>;
    }
  };

  // Share results
  const shareResults = () => {
    if (!gameState.mysteryCeleb) return;
    
    let shareText = `Celeb Wordle - ${gameState.mysteryCeleb.name}\n`;
    shareText += gameState.won ? `I got it in ${gameState.guesses.length}/${gameState.maxGuesses} guesses!` : 'I gave up!';
    shareText += '\n\n';
    
    // Add emoji grid representation of guesses
    gameState.guesses.forEach(guess => {
      const professionMatch = isMatch(guess, 'profession') ? '🟩' : '⬜';
      const ageMatch = isMatch(guess, 'age') ? '🟩' : '⬜';
      const countryMatch = isMatch(guess, 'country') ? '🟩' : '⬜';
      const oscarsMatch = isMatch(guess, 'oscars') ? '🟩' : '⬜';
      const grammysMatch = isMatch(guess, 'grammys') ? '🟩' : '⬜';
      
      shareText += `${professionMatch}${ageMatch}${countryMatch}${oscarsMatch}${grammysMatch}\n`;
    });
    
    shareText += '\nPlay at: https://celebwordle.me';
    
    navigator.clipboard.writeText(shareText)
      .then(() => alert('Results copied to clipboard!'))
      .catch(() => alert('Failed to copy results. Please try again.'));
  };

  if (gameState.loading) {
    return <div className="container">Loading...</div>;
  }

  // Mock data for leaderboard
  const mockTopPlayers = [
    { username: 'WordleWizard', score: 15 },
    { username: 'CelebFan22', score: 12 },
    { username: 'StarGazer', score: 10 },
  ];

  const mockUserStats = {
    gamesPlayed: 27,
    gamesWon: 21,
    currentStreak: 5,
    bestStreak: 8,
  };

  // Mock data for featured categories
  const featuredCategories = [
    { id: '90s-tv', name: '90s TV Stars' },
    { id: 'action-heroes', name: 'Action Heroes' },
    { id: 'pop-icons', name: 'Pop Icons' },
    { id: 'sports-legends', name: 'Sports Legends' },
    { id: 'golden-age', name: 'Hollywood Golden Age' },
  ];

  return (
    <div className="w-full">
            <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://celebwordle.me"
                }
              ]
            }),
          }}
        />
      </Head>
      <SEO
        title="Celeb Wordle - Guess the Celebrity"
        description="Try to guess the mystery celebrity in this fun and challenging game inspired by Wordle."
        keywords="celebrity, wordle, game, guess, fun"
        image="https://example.com/path-to-image.jpg"
        url="https://celebwordle.me"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://www.ufcwordle.com",
          "name": "UFC Wordle",
          "description": "Dive into the exciting world of UFC with UFC Wordle, the ultimate guessing game for MMA enthusiasts.",
          "image": "https://www.ufcwordle.com/wordle.png"
        }}/>

        <Header/>

      <main className="main">
        
        {showInstructions && (
          <div className="instructions">
            <p>Guess the mystery celebrity in {gameState.maxGuesses} tries or less!</p>
            <p>Green cells indicate a match with the mystery celebrity.</p>
            <p>For numeric values, arrows indicate if the mystery celebrity's value is higher (↑) or lower (↓).</p>
            <button 
              className="newGameButton" 
              onClick={() => setShowInstructions(false)}
            >
              Got it!
            </button>
          </div>
        )}
        <DifficultySelector onSelectDifficulty={setSelectedDifficulty} />
        {/* <CategorySelector onSelectCategory={setSelectedCategory} />
        <EraExplorer onSelectEra={setSelectedEra} />
         */}
        {!gameState.gameOver ? (
          <>
            <div className="gameControls">
              <div className="searchContainer">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Start typing to guess a celebrity..."
                  className="searchInput"
                />
                {filteredCelebs.length > 0 && (
                  <div className="dropdown">
                    {filteredCelebs.map((celeb) => (
                      <div 
                        key={celeb.name} 
                        className="dropdownItem"
                        onClick={() => selectCeleb(celeb)}
                      >
                        {celeb.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="buttonContainer">
                <button 
                  className="guessButton"
                  onClick={() => {
                    if (filteredCelebs.length > 0) {
                      selectCeleb(filteredCelebs[0]);
                    }
                  }}
                  disabled={filteredCelebs.length === 0}
                >
                  Guess
                </button>
                <button 
                  className="giveUpButton"
                  onClick={handleGiveUp}
                  disabled={gameState.guesses.length === 0}
                >
                  Give up
                </button>
              </div>
            </div>

            <div className="guessCount">
              Guesses: {gameState.guesses.length}/{gameState.maxGuesses}
            </div>

            <div className="guessesContainer">
              {gameState.guesses.length > 0 && (
                <table className="guessTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Profession</th>
                      <th>Age</th>
                      <th>Country</th>
                      <th>Oscars</th>
                      <th>Grammys</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameState.guesses.map((guess, index) => (
                      <tr key={index}>
                        <td>{guess.name}</td>
                        <td className={isMatch(guess, 'profession') ? "match" : ''}>
                          {guess.profession}
                        </td>
                        <td className={isMatch(guess, 'age') ? "match" : ''}>
                          {guess.age}
                          {!isMatch(guess, 'age') && getDirectionalHint(guess, 'age')}
                        </td>
                        <td className={isMatch(guess, 'country') ? "match" : ''}>
                          {guess.country}
                        </td>
                        <td className={isMatch(guess, 'oscars') ? "match" : ''}>
                          {guess.oscars}
                          {!isMatch(guess, 'oscars') && getDirectionalHint(guess, 'oscars')}
                        </td>
                        <td className={isMatch(guess, 'grammys') ? "match" : ''}>
                          {guess.grammys}
                          {!isMatch(guess, 'grammys') && getDirectionalHint(guess, 'grammys')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="gameOverContainer">
            <h2>The mystery celebrity was:</h2>
            <h1 className="mysteryCelebReveal">
              {gameState.mysteryCeleb?.name}
            </h1>
            
            {gameState.won ? (
              <p>You got it in {gameState.guesses.length} tries!</p>
            ) : (
              <p>You {gameState.gaveUp ? 'gave up' : 'ran out of guesses'} after {gameState.guesses.length} guesses.</p>
            )}
            
            <button 
              className="shareButton"
              onClick={shareResults}
            >
              Share Results
            </button>
            
            <button 
              className="newGameButton"
              onClick={handleNewGame}
            >
              New Game
            </button>
          </div>
        )}
        <div className='mt-32'>
        <Leaderboard 
          topPlayers={mockTopPlayers}
          userStats={mockUserStats}
        />
        
        <FeaturedCategories 
          categories={featuredCategories}
          onSelectCategory={(categoryId) => console.log('Selected category:', categoryId)}
        />
        </div>
      </main>

      <footer className="footer">
        <p>This is a celebrity guessing game inspired by Wordle.</p>
      </footer>
    </div>
  );
}
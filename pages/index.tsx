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

        <div className='flex flex-col items-center justify-center pb-8'>
        <h2 className='text-4xl font-bold'>Celbrity Wordle</h2>
        <h4>Guess the mystery celebrity in {gameState.maxGuesses} tries or less!</h4>
        </div>
        {/* <DifficultySelector onSelectDifficulty={setSelectedDifficulty} /> */}
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

            <div className="guessesContainer px-12">
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
         <div className="my-16 bg-blue-50 p-8 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">GAME RULES</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-800">How to Play</h3>
              <p className="text-gray-700">
                Guess the mystery celebrity in {gameState.maxGuesses} tries or less! Type a celebrity name to make your guess.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Celebrity Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <strong>Name:</strong> The celebrity's full name
                </div>
                <div>
                  <strong>Profession:</strong> Their primary career (Actor, Singer, etc.)
                </div>
                <div>
                  <strong>Age:</strong> Current age in years
                </div>
                <div>
                  <strong>Country:</strong> Country of origin or citizenship
                </div>
                <div>
                  <strong>Oscars:</strong> Number of Academy Awards won
                </div>
                <div>
                  <strong>Grammys:</strong> Number of Grammy Awards won
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Color Hints</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded mr-3"></div>
                  <span><strong>Green:</strong> This attribute matches the mystery celebrity exactly!</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded mr-3"></div>
                  <span><strong>White:</strong> This attribute doesn't match the mystery celebrity.</span>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl mr-3">↑</div>
                  <span><strong>Up Arrow (↑):</strong> The mystery celebrity's value is higher for this attribute.</span>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl mr-3">↓</div>
                  <span><strong>Down Arrow (↓):</strong> The mystery celebrity's value is lower for this attribute.</span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Pro Tip:</strong> Use the directional arrows for age, Oscars, and Grammys to narrow down your guesses. 
                Green matches mean you've found a correct attribute!
              </p>
            </div>
          </div>
        </div>
        <div className="my-16 bg-gray-50 p-8 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">FREQUENTLY ASKED QUESTIONS</h2>
          
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                onClick={() => {
                  const answer = document.getElementById('faq1-answer');
                  const arrow = document.getElementById('faq1-arrow');
                  if (answer && arrow) {
                    answer.classList.toggle('hidden');
                    arrow.classList.toggle('rotate-180');
                  }
                }}
              >
                <span className="font-semibold text-gray-900">How many celebrities are in the game?</span>
                <svg id="faq1-arrow" className="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq1-answer" className="hidden px-6 py-4 bg-gray-50 text-gray-700">
                <p>There are over 100 celebrities in our database, including actors, musicians, athletes, and other famous personalities from various countries and eras.</p>
              </div>
            </div>

            {/* FAQ Item 2 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                onClick={() => {
                  const answer = document.getElementById('faq2-answer');
                  const arrow = document.getElementById('faq2-arrow');
                  if (answer && arrow) {
                    answer.classList.toggle('hidden');
                    arrow.classList.toggle('rotate-180');
                  }
                }}
              >
                <span className="font-semibold text-gray-900">Can I play multiple games per day?</span>
                <svg id="faq2-arrow" className="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq2-answer" className="hidden px-6 py-4 bg-gray-50 text-gray-700">
                <p>Yes! Unlike the original Wordle, you can play as many games as you want. Each game features a different random celebrity, so the fun never ends.</p>
              </div>
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                onClick={() => {
                  const answer = document.getElementById('faq3-answer');
                  const arrow = document.getElementById('faq3-arrow');
                  if (answer && arrow) {
                    answer.classList.toggle('hidden');
                    arrow.classList.toggle('rotate-180');
                  }
                }}
              >
                <span className="font-semibold text-gray-900">What if I don't know a celebrity?</span>
                <svg id="faq3-arrow" className="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq3-answer" className="hidden px-6 py-4 bg-gray-50 text-gray-700">
                <p>Don't worry! You can always click "Give Up" to reveal the answer and start a new game. You can also use the hints from your previous guesses to make educated guesses.</p>
              </div>
            </div>

            {/* FAQ Item 4 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                onClick={() => {
                  const answer = document.getElementById('faq4-answer');
                  const arrow = document.getElementById('faq4-arrow');
                  if (answer && arrow) {
                    answer.classList.toggle('hidden');
                    arrow.classList.toggle('rotate-180');
                  }
                }}
              >
                <span className="font-semibold text-gray-900">How accurate is the celebrity data?</span>
                <svg id="faq4-arrow" className="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq4-answer" className="hidden px-6 py-4 bg-gray-50 text-gray-700">
                <p>We strive to keep our celebrity database as accurate and up-to-date as possible. Ages are current as of the game's creation, and award counts reflect the latest available information.</p>
              </div>
            </div>

            {/* FAQ Item 5 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                onClick={() => {
                  const answer = document.getElementById('faq5-answer');
                  const arrow = document.getElementById('faq5-arrow');
                  if (answer && arrow) {
                    answer.classList.toggle('hidden');
                    arrow.classList.toggle('rotate-180');
                  }
                }}
              >
                <span className="font-semibold text-gray-900">Can I share my results?</span>
                <svg id="faq5-arrow" className="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq5-answer" className="hidden px-6 py-4 bg-gray-50 text-gray-700">
                <p>Absolutely! After each game, you can click "Share Results" to copy your game results to your clipboard, including the celebrity name and your guess pattern with emojis.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className='mt-32'></div>
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
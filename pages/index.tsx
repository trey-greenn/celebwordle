import { useState, useEffect } from 'react';
import Head from 'next/head';

// Dummy data for celebrities based on celebwordle.csv
const dummyCelebs = [
  { name: "Beyoncé", profession: "Singer", age: 42, country: "USA", oscars: 0, grammys: 32 },
  { name: "Leonardo DiCaprio", profession: "Actor", age: 49, country: "USA", oscars: 1, grammys: 0 },
  { name: "Taylor Swift", profession: "Singer", age: 34, country: "USA", oscars: 0, grammys: 14 },
  { name: "Tom Hanks", profession: "Actor", age: 67, country: "USA", oscars: 2, grammys: 0 },
  { name: "Jennifer Lopez", profession: "Singer/Actor", age: 54, country: "USA", oscars: 0, grammys: 0 },
  { name: "Brad Pitt", profession: "Actor", age: 60, country: "USA", oscars: 2, grammys: 0 },
  { name: "Meryl Streep", profession: "Actor", age: 74, country: "USA", oscars: 3, grammys: 0 },
  { name: "Ed Sheeran", profession: "Singer", age: 33, country: "UK", oscars: 0, grammys: 4 },
  { name: "Rihanna", profession: "Singer", age: 36, country: "Barbados", oscars: 0, grammys: 9 },
  { name: "Dwayne Johnson", profession: "Actor", age: 52, country: "USA", oscars: 0, grammys: 0 },
];

// Game state interface
interface GameState {
  mysteryCeleb: typeof dummyCelebs[0] | null;
  guesses: typeof dummyCelebs[0][];
  gameOver: boolean;
  won: boolean;
  gaveUp: boolean;
  loading: boolean;
  maxGuesses: number;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCelebs, setFilteredCelebs] = useState<typeof dummyCelebs>([]);
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
    // Select a random celebrity as the mystery celebrity
    const randomIndex = Math.floor(Math.random() * dummyCelebs.length);
    setGameState(prev => ({
      ...prev,
      mysteryCeleb: dummyCelebs[randomIndex],
      loading: false
    }));
    
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
      const filtered = dummyCelebs.filter(celeb => 
        celeb.name.toLowerCase().includes(term.toLowerCase()) &&
        !gameState.guesses.some(guess => guess.name === celeb.name)
      );
      setFilteredCelebs(filtered);
    } else {
      setFilteredCelebs([]);
    }
  };

  // Handle celebrity selection
  const selectCeleb = (celeb: typeof dummyCelebs[0]) => {
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
    const randomIndex = Math.floor(Math.random() * dummyCelebs.length);
    setGameState({
      mysteryCeleb: dummyCelebs[randomIndex],
      guesses: [],
      gameOver: false,
      won: false,
      gaveUp: false,
      loading: false,
      maxGuesses: 8
    });
  };

  // Check if a property matches the mystery celebrity
  const isMatch = (guess: typeof dummyCelebs[0], property: keyof typeof dummyCelebs[0]) => {
    if (!gameState.mysteryCeleb) return false;
    return guess[property] === gameState.mysteryCeleb[property];
  };

  // Get directional hint for numeric values
  const getDirectionalHint = (guess: typeof dummyCelebs[0], property: 'age' | 'oscars' | 'grammys') => {
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

  return (
    <div className="container">
      <Head>
        <title>Celeb Wordle</title>
        <meta name="description" content="Guess the Celebrity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">Celeb Wordle</h1>
        
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
      </main>

      <footer className="footer">
        <p>This is a celebrity guessing game inspired by Wordle.</p>
      </footer>
    </div>
  );
}
import { useState, useEffect } from 'react';
import Head from 'next/head';

// Dummy data for players
const dummyPlayers = [
  { name: "Scump", nationality: "USA", age: 29, wins: 31, rings: 1, teams: ["OpTic", "Chicago Huntsmen"], teammates: ["FormaL", "Dashy", "Envoy"] },
  { name: "Crimsix", nationality: "USA", age: 31, wins: 37, rings: 3, teams: ["OpTic", "Dallas Empire", "New York Subliners"], teammates: ["Clayster", "Shotzzy", "iLLeY"] },
  { name: "Simp", nationality: "USA", age: 23, wins: 15, rings: 2, teams: ["Atlanta FaZe"], teammates: ["aBeZy", "Cellium", "Arcitys"] },
  { name: "Shotzzy", nationality: "USA", age: 22, wins: 8, rings: 1, teams: ["Dallas Empire", "OpTic Texas"], teammates: ["Dashy", "iLLeY", "Huke"] },
  { name: "Clayster", nationality: "USA", age: 32, wins: 20, rings: 3, teams: ["Dallas Empire", "New York Subliners", "LA Guerrillas"], teammates: ["Crimsix", "Hydra", "Asim"] },
  { name: "Cellium", nationality: "USA", age: 24, wins: 14, rings: 2, teams: ["Atlanta FaZe"], teammates: ["Simp", "aBeZy", "Arcitys"] },
  { name: "Hydra", nationality: "France", age: 21, wins: 3, rings: 0, teams: ["New York Subliners"], teammates: ["Clayster", "Crimsix", "Kismet"] },
  { name: "Dashy", nationality: "Canada", age: 25, wins: 5, rings: 0, teams: ["OpTic"], teammates: ["Scump", "Shotzzy", "iLLeY"] },
  { name: "aBeZy", nationality: "USA", age: 23, wins: 14, rings: 2, teams: ["Atlanta FaZe"], teammates: ["Simp", "Cellium", "Arcitys"] },
  { name: "Arcitys", nationality: "USA", age: 25, wins: 12, rings: 2, teams: ["Chicago Huntsmen", "Atlanta FaZe"], teammates: ["Scump", "Simp", "aBeZy"] },
  { name: "FormaL", nationality: "USA", age: 30, wins: 23, rings: 1, teams: ["OpTic", "Chicago Huntsmen"], teammates: ["Scump", "Dashy", "Envoy"] },
  { name: "Envoy", nationality: "USA", age: 24, wins: 6, rings: 0, teams: ["Chicago Huntsmen", "OpTic", "LA Thieves"], teammates: ["Scump", "FormaL", "Kenny"] },
  { name: "Kenny", nationality: "USA", age: 23, wins: 7, rings: 1, teams: ["LA Thieves"], teammates: ["Envoy", "Octane", "Drazah"] },
  { name: "Octane", nationality: "USA", age: 27, wins: 9, rings: 1, teams: ["Seattle Surge", "LA Thieves"], teammates: ["Kenny", "Drazah", "Mack"] },
  { name: "SlasheR", nationality: "USA", age: 28, wins: 11, rings: 1, teams: ["LA Thieves", "LA Guerrillas"], teammates: ["Kenny", "Huke", "Asim"] },
];

// Game state interface
interface GameState {
  mysteryPlayer: typeof dummyPlayers[0] | null;
  guesses: typeof dummyPlayers[0][];
  gameOver: boolean;
  won: boolean;
  gaveUp: boolean;
  loading: boolean;
  maxGuesses: number;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<typeof dummyPlayers>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    mysteryPlayer: null,
    guesses: [],
    gameOver: false,
    won: false,
    gaveUp: false,
    loading: true,
    maxGuesses: 8
  });

  // Initialize game on component mount
  useEffect(() => {
    // Select a random player as the mystery player
    const randomIndex = Math.floor(Math.random() * dummyPlayers.length);
    setGameState(prev => ({
      ...prev,
      mysteryPlayer: dummyPlayers[randomIndex],
      loading: false
    }));
    
    // Check if user has played before
    const hasPlayed = localStorage.getItem('cdlWordleHasPlayed');
    if (hasPlayed) {
      setShowInstructions(false);
    } else {
      localStorage.setItem('cdlWordleHasPlayed', 'true');
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      const filtered = dummyPlayers.filter(player => 
        player.name.toLowerCase().includes(term.toLowerCase()) &&
        !gameState.guesses.some(guess => guess.name === player.name)
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers([]);
    }
  };

  // Handle player selection
  const selectPlayer = (player: typeof dummyPlayers[0]) => {
    setSearchTerm('');
    setFilteredPlayers([]);
    
    // Check if player is already guessed
    if (gameState.guesses.some(guess => guess.name === player.name)) {
      return;
    }
    
    // Check if player is the mystery player
    const isCorrect = player.name === gameState.mysteryPlayer?.name;
    
    const newGuesses = [...gameState.guesses, player];
    
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
    const randomIndex = Math.floor(Math.random() * dummyPlayers.length);
    setGameState({
      mysteryPlayer: dummyPlayers[randomIndex],
      guesses: [],
      gameOver: false,
      won: false,
      gaveUp: false,
      loading: false,
      maxGuesses: 8
    });
  };

  // Check if a property matches the mystery player
  const isMatch = (guess: typeof dummyPlayers[0], property: keyof typeof dummyPlayers[0]) => {
    if (!gameState.mysteryPlayer) return false;
    
    if (property === 'teams' || property === 'teammates') {
      // For arrays, check if there's any overlap
      return (guess[property] as any[]).some(item => 
        (gameState.mysteryPlayer![property] as any[]).includes(item)
      );
    }
    
    return guess[property] === gameState.mysteryPlayer[property];
  };

  // Get directional hint for numeric values
  const getDirectionalHint = (guess: typeof dummyPlayers[0], property: 'age' | 'wins' | 'rings') => {
    if (!gameState.mysteryPlayer) return null;
    
    if (guess[property] === gameState.mysteryPlayer[property]) {
      return null;
    }
    
    if (guess[property] < gameState.mysteryPlayer[property]) {
      return <span className={`directionalHint higher`}>↑</span>;
    } else {
      return <span className={`directionalHint lower`}>↓</span>;
    }
  };

  // Share results
  const shareResults = () => {
    if (!gameState.mysteryPlayer) return;
    
    let shareText = `CDL Wordle - ${gameState.mysteryPlayer.name}\n`;
    shareText += gameState.won ? `I got it in ${gameState.guesses.length}/${gameState.maxGuesses} guesses!` : 'I gave up!';
    shareText += '\n\n';
    
    // Add emoji grid representation of guesses
    gameState.guesses.forEach(guess => {
      const nationalityMatch = isMatch(guess, 'nationality') ? '🟩' : '⬜';
      const ageMatch = isMatch(guess, 'age') ? '🟩' : '⬜';
      const winsMatch = isMatch(guess, 'wins') ? '🟩' : '⬜';
      const ringsMatch = isMatch(guess, 'rings') ? '🟩' : '⬜';
      const teamsMatch = isMatch(guess, 'teams') ? '🟩' : '⬜';
      const teammatesMatch = isMatch(guess, 'teammates') ? '🟩' : '⬜';
      
      shareText += `${nationalityMatch}${ageMatch}${winsMatch}${ringsMatch}${teamsMatch}${teammatesMatch}\n`;
    });
    
    shareText += '\nPlay at: https://cdlwordle.me';
    
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
        <title>CDL Wordle</title>
        <meta name="description" content="Guess the CDL player" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">CDL Wordle</h1>
        
        {showInstructions && (
          <div className="instructions">
            <p>Guess the mystery CDL player in {gameState.maxGuesses} tries or less!</p>
            <p>Green cells indicate a match with the mystery player.</p>
            <p>For numeric values, arrows indicate if the mystery player's value is higher (↑) or lower (↓).</p>
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
                  placeholder="Start typing to guess a player..."
                  className="searchInput"
                />
                {filteredPlayers.length > 0 && (
                  <div className="dropdown">
                    {filteredPlayers.map((player) => (
                      <div 
                        key={player.name} 
                        className="dropdownItem"
                        onClick={() => selectPlayer(player)}
                      >
                        {player.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="buttonContainer">
                <button 
                  className="guessButton"
                  onClick={() => {
                    if (filteredPlayers.length > 0) {
                      selectPlayer(filteredPlayers[0]);
                    }
                  }}
                  disabled={filteredPlayers.length === 0}
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
                      <th>Nationality</th>
                      <th>Age</th>
                      <th>Wins</th>
                      <th>Rings</th>
                      <th>Teams</th>
                      <th>Teammates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameState.guesses.map((guess, index) => (
                      <tr key={index}>
                        <td>{guess.name}</td>
                        <td className={isMatch(guess, 'nationality') ? "match" : ''}>
                          {guess.nationality}
                        </td>
                        <td className={isMatch(guess, 'age') ? "match" : ''}>
                          {guess.age}
                          {!isMatch(guess, 'age') && getDirectionalHint(guess, 'age')}
                        </td>
                        <td className={isMatch(guess, 'wins') ? "match" : ''}>
                          {guess.wins}
                          {!isMatch(guess, 'wins') && getDirectionalHint(guess, 'wins')}
                        </td>
                        <td className={isMatch(guess, 'rings') ? "match" : ''}>
                          {guess.rings}
                          {!isMatch(guess, 'rings') && getDirectionalHint(guess, 'rings')}
                        </td>
                        <td className={isMatch(guess, 'teams') ? "match" : ''}>
                          {guess.teams.join(', ')}
                        </td>
                        <td className={isMatch(guess, 'teammates') ? "match" : ''}>
                          {guess.teammates.join(', ')}
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
            <h2>The mystery player was:</h2>
            <h1 className="mysteryPlayerReveal">
              {gameState.mysteryPlayer?.name}
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
        <p>Created by Diz</p>
        <p>This site is not affiliated with the Call of Duty League or Activision.</p>
      </footer>
    </div>
  );
}
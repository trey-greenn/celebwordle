interface LeaderboardPlayer {
    username: string;
    score: number;
  }
  
  interface UserStats {
    gamesPlayed: number;
    gamesWon: number;
    currentStreak: number;
    bestStreak: number;
  }
  
  interface LeaderboardProps {
    topPlayers: LeaderboardPlayer[];
    userStats: UserStats;
  }
  
  export const Leaderboard: React.FC<LeaderboardProps> = ({ 
    topPlayers, 
    userStats 
  }) => {
    return (
      <section className="my-10 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-6 text-black">LEADERBOARD & STATISTICS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="leaderboard">
            <h3 className="text-lg font-semibold mb-3 text-black">LEADERBOARD</h3>
            <ul className="space-y-2 text-black">
              {topPlayers.map((player, index) => (
                <li key={player.username} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{index + 1}.</span>
                    <span>{player.username}</span>
                  </div>
                  <span className="font-medium">{player.score}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="user-stats">
            <h3 className="text-lg font-semibold mb-3 text-black">YOUR STATS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-item">
                <p className="text-gray-600">Games</p>
                <p className="text-2xl font-bold text-black">{userStats.gamesPlayed}</p>
              </div>
              <div className="stat-item">
                <p className="text-gray-600">Won</p>
                <p className="text-2xl font-bold text-black">{userStats.gamesWon}</p>
              </div>
              <div className="stat-item">
                <p className="text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold">{userStats.currentStreak}</p>
              </div>
              <div className="stat-item">
                <p className="text-gray-600">Best Streak</p>
                <p className="text-2xl font-bold">{userStats.bestStreak}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
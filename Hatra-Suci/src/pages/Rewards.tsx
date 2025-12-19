import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, TrendingUp, Users, DollarSign, Award, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BlockchainBackground from '@/components/BlockchainBackground';
import { userAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const Rewards = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [leftTeamCount, setLeftTeamCount] = useState(0);
  const [rightTeamCount, setRightTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const referralsRes = await userAPI.getReferrals();
      
      // Count left and right team members
      const leftCount = referralsRes.data.filter((ref: any) => ref.side === 'left').length;
      const rightCount = referralsRes.data.filter((ref: any) => ref.side === 'right').length;
      
      setLeftTeamCount(leftCount);
      setRightTeamCount(rightCount);
      
      // Calculate current level based on achieved requirements
      let calculatedLevel = 1;
      for (let i = levelRewards.length - 1; i >= 1; i--) {
        if (leftCount >= levelRewards[i].leftRequired && rightCount >= levelRewards[i].rightRequired) {
          calculatedLevel = levelRewards[i].level;
          break;
        }
      }
      setCurrentLevel(calculatedLevel);
      
      // Check for level rewards
      await userAPI.checkLevelRewards();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load rewards data'
      });
    } finally {
      setLoading(false);
    }
  };

  const levelRewards = [
    { level: 0, leftRequired: 0, rightRequired: 0, reward: null, rank: null, description: 'No reward at this level' },
    { level: 1, leftRequired: 1, rightRequired: 1, reward: '$11', rank: null, description: 'First level reward - Get started!' },
    { level: 2, leftRequired: 6, rightRequired: 6, reward: '$67', rank: null, description: 'Initial level reward' },
    { level: 3, leftRequired: 12, rightRequired: 12, reward: '$89', rank: 'Director', description: 'Achieve Director rank' },
    { level: 4, leftRequired: 25, rightRequired: 25, reward: '$167', rank: 'Executive Director', description: 'Reach Executive Director status' },
    { level: 5, leftRequired: 50, rightRequired: 50, reward: '$278', rank: 'Board Member', description: 'Become a Board Member' },
    { level: 6, leftRequired: 75, rightRequired: 75, reward: '$389 (10,000 + 25,000 Bonus → 35,000 INR)', rank: 'Silver Member', description: 'Unlock Silver Member status with bonus' },
    { level: 7, leftRequired: 120, rightRequired: 120, reward: '$556 (Electric Bike equivalent)', rank: 'Gold Member', description: 'Gold Member with electric bike reward' },
    { level: 8, leftRequired: 160, rightRequired: 160, reward: '$1333 (Car Down Payment)', rank: 'District Officer', description: 'District Officer with car down payment' },
    { level: 9, leftRequired: 220, rightRequired: 220, reward: '$1667 (Indonesia Tour)', rank: null, description: 'Exclusive Indonesia tour package' },
    { level: 10, leftRequired: 300, rightRequired: 300, reward: '$2500 (Bullet Bike)', rank: null, description: 'Classic Bullet Bike reward' },
    { level: 11, leftRequired: 500, rightRequired: 500, reward: '$8889 (Car)', rank: null, description: 'Full car reward' },
    { level: 12, leftRequired: 1500, rightRequired: 1500, reward: '$50,000 (Flat / Bungalow)', rank: null, description: 'Ultimate property reward' },
  ];

  const getRewardIcon = (level: number) => {
    if (level <= 3) return '💰';
    if (level === 4) return '🏍️';
    if (level === 5) return '🏊';
    if (level === 6) return '⚡';
    if (level === 7) return '🚗';
    if (level === 8) return '✈️';
    if (level === 9) return '🏍️';
    if (level === 10) return '❤️';
    if (level === 11) return '🏠';
    return '🎁';
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BlockchainBackground />
        <div className="relative z-10 text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BlockchainBackground />
      
      <div className="relative z-10 p-4 max-w-4xl mx-auto pb-20">
        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold flex-1 text-center pr-8">Rewards & Offers</h1>
        </header>

        {/* Current Level Card */}
        <Card className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 border-2 border-primary/50 p-6 mb-6 card-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-bold text-gradient-gold">Level {currentLevel}</p>
              </div>
            </div>
            <Award className="w-12 h-12 text-primary/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground mb-1">Left Team</p>
              <p className="text-xl font-bold">{leftTeamCount} / {currentLevel < levelRewards.length ? levelRewards[currentLevel].leftRequired : 'N/A'}</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground mb-1">Right Team</p>
              <p className="text-xl font-bold">{rightTeamCount} / {currentLevel < levelRewards.length ? levelRewards[currentLevel].rightRequired : 'N/A'}</p>
            </div>
          </div>

          {levelRewards[currentLevel].rank && (
            <div className="mt-3 bg-card/50 backdrop-blur-sm rounded-lg p-3 text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground mb-1">Current Rank</p>
              <p className="text-2xl font-bold text-gradient-gold">{levelRewards[currentLevel].rank}</p>
            </div>
          )}

          {levelRewards[currentLevel].reward && (
            <div className="mt-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3 text-center">
              <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground mb-1">Reward at Current Level</p>
              <p className="text-lg font-bold text-green-500">{levelRewards[currentLevel].reward}</p>
            </div>
          )}
        </Card>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-400">
            <span className="font-semibold">Note:</span> Complete the required left (L) and right (R) team members to unlock each level reward. Level 0 has no rewards. All amounts are in USD (90 INR = 1 USD).
          </p>
        </div>

        {/* All Levels */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            All Level Rewards
          </h2>

          {levelRewards.map((level) => {
            const isCurrentLevel = level.level === currentLevel;
            const isCompleted = level.level < currentLevel;
            const isLocked = level.level > currentLevel;

            return (
              <Card 
                key={level.level}
                className={`p-5 transition-all ${
                  isCurrentLevel 
                    ? 'border-2 border-primary bg-primary/5 shadow-lg' 
                    : isCompleted
                    ? 'border-2 border-green-500/50 bg-green-500/5'
                    : 'border border-border bg-card/90 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Level Icon */}
                  <div className={`text-5xl ${isLocked ? 'grayscale opacity-50' : ''}`}>
                    {getRewardIcon(level.level)}
                  </div>

                  {/* Level Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xl font-bold ${
                        isCurrentLevel ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-foreground'
                      }`}>
                        Level {level.level}
                      </h3>
                      {isCurrentLevel && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                          Current
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          ✓ Completed
                        </span>
                      )}
                      {isLocked && (
                        <span className="bg-secondary text-muted-foreground text-xs px-2 py-1 rounded-full font-semibold">
                          🔒 Locked
                        </span>
                      )}
                    </div>

                    {level.rank && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                          🏆 {level.rank}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mb-3">{level.description}</p>

                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Left Team</p>
                        <p className="font-bold">{level.leftRequired === 0 ? 'N/A' : `${level.leftRequired} members`}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Right Team</p>
                        <p className="font-bold">{level.rightRequired === 0 ? 'N/A' : `${level.rightRequired} members`}</p>
                      </div>
                    </div>

                    {/* Rewards */}
                    {level.reward ? (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-sm font-semibold text-green-500 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Reward: {level.reward}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-secondary/20 border border-border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground text-center">No reward at this level</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar for Current Level */}
                {isCurrentLevel && level.leftRequired > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Your Progress</span>
                      <span>{Math.min(100, Math.round((Math.min(leftTeamCount, rightTeamCount) / level.leftRequired) * 100))}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.round((Math.min(leftTeamCount, rightTeamCount) / level.leftRequired) * 100))}%` }} 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {leftTeamCount} left / {rightTeamCount} right of {level.leftRequired} required for each side
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <Card className="mt-6 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50 p-6 text-center">
          <h3 className="text-lg font-bold mb-2">Start Building Your Team Today!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Invite friends and grow your network to unlock amazing rewards
          </p>
          <Button 
            variant="gold" 
            size="lg"
            onClick={() => navigate('/referrals')}
          >
            View Referrals
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;

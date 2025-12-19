import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, Users, User, Settings, Gift, TrendingUp, LogOut, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import BlockchainBackground from '@/components/BlockchainBackground';
import SpinWheel from '@/components/SpinWheel';
import { authAPI, userAPI } from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [canSpin, setCanSpin] = useState(true);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextSpinTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = nextSpinTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCanSpin(true);
        setTimeRemaining('');
        setNextSpinTime(null);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextSpinTime]);

  const checkSpinStatus = (spinWheelLastUsed: any) => {
    if (!spinWheelLastUsed) {
      setCanSpin(true);
      return;
    }

    const now = new Date();
    const lastSpin = new Date(spinWheelLastUsed);
    
    // Calculate start of today (midnight)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    // Calculate start of tomorrow (next midnight)
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    
    // Check if last spin was today (same calendar day)
    if (lastSpin >= startOfToday) {
      setCanSpin(false);
      setNextSpinTime(startOfTomorrow);
    } else {
      setCanSpin(true);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [profileRes, referralsRes] = await Promise.all([
        authAPI.getProfile(),
        userAPI.getReferrals()
      ]);

      setUserData(profileRes.data);
      // Normalize referrals: assign default 'left' side when absent (legacy data)
      const normalizedReferrals = referralsRes.data.map((ref: any) => ({
        ...ref,
        side: ref.side || 'left'
      }));
      setReferrals(normalizedReferrals);
      
      // Check spin status
      checkSpinStatus(profileRes.data.spinWheelLastUsed);
      
      // Check for level rewards and refetch profile to get updated balance
      try {
        await userAPI.checkLevelRewards();
        // Refetch profile to get updated balance and achievedLevels
        const updatedProfile = await authAPI.getProfile();
        setUserData(updatedProfile.data);
        
        // Calculate current level from achievedLevels
        const achievedLevels = updatedProfile.data.achievedLevels || [];
        if (achievedLevels.length > 0) {
          setCurrentLevel(Math.max(...achievedLevels));
        }
      } catch (error) {
        console.error('Error checking level rewards:', error);
        // Don't show error to user as this is a background check
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load user data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account',
    });
    navigate('/login');
  };

  const levelRewards = [
    { level: 0, leftRequired: 0, rightRequired: 0, totalRequired: 0, bonus: 0, reward: null, rank: null },
    { level: 1, leftRequired: 1, rightRequired: 1, totalRequired: 0, bonus: 0, reward: '$11', rank: null },
    { level: 2, leftRequired: 6, rightRequired: 6, totalRequired: 0, bonus: 0, reward: '$67', rank: null },
    { level: 3, leftRequired: 12, rightRequired: 12, totalRequired: 0, bonus: 0, reward: '$89', rank: 'Director' },
    { level: 4, leftRequired: 25, rightRequired: 25, totalRequired: 0, bonus: 0, reward: '$167', rank: 'Executive Director' },
    { level: 5, leftRequired: 50, rightRequired: 50, totalRequired: 0, bonus: 0, reward: '$278', rank: 'Board Member' },
    { level: 6, leftRequired: 75, rightRequired: 75, totalRequired: 0, bonus: 0, reward: '$389', rank: 'Silver Member' },
    { level: 7, leftRequired: 120, rightRequired: 120, totalRequired: 0, bonus: 0, reward: '$556 (Electric Bike equivalent)', rank: 'Gold Member' },
    { level: 8, leftRequired: 160, rightRequired: 160, totalRequired: 0, bonus: 0, reward: '$1333 (Car Down Payment)', rank: 'District Officer' },
    { level: 9, leftRequired: 220, rightRequired: 220, totalRequired: 0, bonus: 0, reward: '$1667 (Indonesia Tour)', rank: null },
    { level: 10, leftRequired: 300, rightRequired: 300, totalRequired: 0, bonus: 0, reward: '$2500 (Bullet Bike)', rank: null },
    { level: 11, leftRequired: 500, rightRequired: 500, totalRequired: 0, bonus: 0, reward: '$8889 (Car)', rank: null },
    { level: 12, leftRequired: 1500, rightRequired: 1500, totalRequired: 0, bonus: 0, reward: '$50,000 (Flat / Bungalow)', rank: null },
  ];

  return (
    <div className="min-h-screen relative">
      <BlockchainBackground />
      
      <div className="relative z-10 p-4 max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-gradient-gold tracking-wider">Hatra Suci</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors">
                  <User className="w-5 h-5 text-accent-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData?.username || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userData?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/transactions')}>
                  <Activity className="mr-2 h-4 w-4" />
                  <span>Transactions</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Token Balance */}
        <div className="border-2 border-border rounded-xl bg-card/90 backdrop-blur-sm p-6 mb-4 card-glow text-center">
          {loading ? (
            <div className="flex justify-center py-4">
              <Activity className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-gradient-gold mb-1">${(userData?.balance || 0).toFixed(2)}</h2>
              <p className="text-muted-foreground">Available Balance</p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Button 
            variant="action" 
            size="lg" 
            className="flex-col h-auto py-4"
            onClick={() => navigate('/deposit')}
          >
            <ArrowDownCircle className="w-6 h-6 text-primary mb-1" />
            <span>Deposit</span>
          </Button>
          <Button 
            variant="action" 
            size="lg" 
            className="flex-col h-auto py-4"
            onClick={() => navigate('/withdraw')}
          >
            <ArrowUpCircle className="w-6 h-6 text-accent mb-1" />
            <span>Withdraw</span>
          </Button>
          <Button 
            variant="action" 
            size="lg" 
            className="flex-col h-auto py-4"
            onClick={() => navigate('/referrals')}
          >
            <Users className="w-6 h-6 text-primary mb-1" />
            <span>Referrals</span>
          </Button>
        </div>

        {/* Daily Reward */}
        <div className="border-2 border-primary rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm p-4 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {canSpin ? 'Daily Reward Available!' : 'Daily Reward Claimed'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {canSpin ? 'Spin & Win 0.5-0.8 Tokens' : `Next reward in: ${timeRemaining}`}
            </p>
          </div>
          <Button 
            variant="gold" 
            onClick={() => setShowSpinWheel(true)}
            disabled={!canSpin}
          >
            {canSpin ? 'Scratch Now' : 'Claimed'}
          </Button>
        </div>

        {/* Offer Rewards Section */}
        <div className="border-2 border-border rounded-xl bg-card/90 backdrop-blur-sm p-4 card-glow mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Level Rewards & Offers</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Level {currentLevel}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/rewards')}
              >
                View All
              </Button>
            </div>
          </div>

          {/* Current Level Progress */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Progress</span>
              <span className="text-xs text-muted-foreground">Level {currentLevel}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-card/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">Left Team</p>
                <p className="text-lg font-bold text-primary">
                  {referrals.filter((r: any) => r.side === 'left').length} / {currentLevel < levelRewards.length ? levelRewards[currentLevel].leftRequired : 'N/A'}
                </p>
              </div>
              <div className="bg-card/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">Right Team</p>
                <p className="text-lg font-bold text-accent">
                  {referrals.filter((r: any) => r.side === 'right').length} / {currentLevel < levelRewards.length ? levelRewards[currentLevel].rightRequired : 'N/A'}
                </p>
              </div>
            </div>
            {currentLevel < levelRewards.length && levelRewards[currentLevel].rank && (
              <div className="bg-card/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">Current Rank</p>
                <p className="text-lg font-bold text-gradient-gold">{levelRewards[currentLevel].rank}</p>
              </div>
            )}
          </div>

          {/* Rewards List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {levelRewards.slice(1).map((level) => {
              const isCurrentLevel = level.level === currentLevel;
              const isCompleted = level.level < currentLevel;
              
              return (
                <div 
                  key={level.level}
                  className={`border rounded-lg p-3 transition-all ${
                    isCurrentLevel 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : isCompleted
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-border bg-card/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${
                          isCurrentLevel ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                        }`}>
                          Level {level.level}
                        </span>
                        {isCurrentLevel && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      {level.rank && (
                        <div className="text-xs font-semibold text-primary mb-1">
                          🏆 {level.rank}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mb-1">
                        L: {level.leftRequired} + R: {level.rightRequired}
                      </div>
                      {level.reward && (
                        <div className="text-sm font-semibold text-gradient-gold">
                          💰 {level.reward}
                        </div>
                      )}
                    </div>
                    {isCurrentLevel && (
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referrals Table */}
        <div className="border-2 border-border rounded-xl bg-card/90 backdrop-blur-sm p-4 card-glow">
          <h3 className="text-lg font-semibold mb-4">Your Referrals</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Activity className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground mt-1">Share your referral code to earn rewards</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">User</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.slice(0, 5).map((ref: any) => (
                    <tr key={ref._id} className="border-b border-border/50 last:border-0">
                      <td className="py-3">{ref.referred?.username || 'Unknown'}</td>
                      <td className="py-3 text-muted-foreground text-sm">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-primary font-semibold">
                        ${ref.commission.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {referrals.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" onClick={() => navigate('/referrals')}>
                    View All Referrals
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSpinWheel && (
        <SpinWheel 
          onClose={() => setShowSpinWheel(false)} 
          onRewardClaimed={async () => {
            // Refresh user data to show updated balance and spin state
            await fetchUserData();
            
            // Immediately update spin state to disabled with midnight reset
            const now = new Date();
            const startOfTomorrow = new Date(now);
            startOfTomorrow.setHours(0, 0, 0, 0);
            startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
            setCanSpin(false);
            setNextSpinTime(startOfTomorrow);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

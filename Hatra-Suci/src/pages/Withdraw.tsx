import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlockchainBackground from '@/components/BlockchainBackground';
import { toast } from '@/hooks/use-toast';
import { authAPI, userAPI } from '@/services/api';

const Withdraw = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lockAmount, setLockAmount] = useState(65);
  const [lockDays, setLockDays] = useState(90);
  const [userCreatedAt, setUserCreatedAt] = useState<Date | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  
  const withdrawAmount = parseFloat(amount) || 0;
  const remainingBalance = availableBalance - withdrawAmount;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          authAPI.getProfile(),
          authAPI.getPublicSettings()
        ]);
        
        setCurrentBalance(profileRes.data.balance || 0);
        setUserCreatedAt(profileRes.data.createdAt ? new Date(profileRes.data.createdAt) : null);
        setLockAmount(settingsRes.data.withdrawLockAmount || 65);
        setLockDays(settingsRes.data.withdrawLockDays || 90);
        
        // Calculate available balance
        if (profileRes.data.createdAt) {
          const accountAge = Math.floor((Date.now() - new Date(profileRes.data.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          const isWithinLockPeriod = accountAge < (settingsRes.data.withdrawLockDays || 90);
          const available = isWithinLockPeriod 
            ? Math.max(0, (profileRes.data.balance || 0) - (settingsRes.data.withdrawLockAmount || 65))
            : (profileRes.data.balance || 0);
          setAvailableBalance(available);
        } else {
          setAvailableBalance(profileRes.data.balance || 0);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load balance',
          variant: 'destructive'
        });
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) {
      toast({ 
        title: 'Invalid Amount', 
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive'
      });
      return;
    }
    if (withdrawAmount < 10) {
      toast({ 
        title: 'Below Minimum', 
        description: 'Minimum withdrawal amount is 10 USDT.',
        variant: 'destructive'
      });
      return;
    }
    if (withdrawAmount > availableBalance) {
      toast({ 
        title: 'Insufficient Balance', 
        description: `Withdrawal amount exceeds available balance ($${availableBalance.toFixed(2)}).`,
        variant: 'destructive'
      });
      return;
    }
    if (!walletAddress) {
      toast({ 
        title: 'Wallet Required', 
        description: 'Please enter your wallet address.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      await userAPI.createWithdrawal({ 
        amount: withdrawAmount, 
        walletAddress 
      });
      
      toast({ 
        title: 'Withdrawal Requested', 
        description: 'Your withdrawal is pending approval.' 
      });
      
      // Reset form
      setAmount('');
      setWalletAddress('');
      
      // Refresh balance and recalculate available
      const [profileRes, settingsRes] = await Promise.all([
        authAPI.getProfile(),
        authAPI.getPublicSettings()
      ]);
      
      setCurrentBalance(profileRes.data.balance || 0);
      
      if (profileRes.data.createdAt) {
        const accountAge = Math.floor((Date.now() - new Date(profileRes.data.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const isWithinLockPeriod = accountAge < (settingsRes.data.withdrawLockDays || 90);
        const available = isWithinLockPeriod 
          ? Math.max(0, (profileRes.data.balance || 0) - (settingsRes.data.withdrawLockAmount || 65))
          : (profileRes.data.balance || 0);
        setAvailableBalance(available);
      } else {
        setAvailableBalance(profileRes.data.balance || 0);
      }
    } catch (error: any) {
      toast({ 
        title: 'Withdrawal Failed', 
        description: error.response?.data?.message || 'Failed to submit withdrawal request.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <BlockchainBackground />
      
      <div className="relative z-10 p-4 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold flex-1 text-center pr-8">Withdraw USDT (BEP20)</h1>
        </header>

        {/* Form */}
        <div className="border-2 border-border rounded-xl bg-card/90 backdrop-blur-sm p-6 card-glow">
          {/* Token Information */}
          <div className="space-y-4 mb-6">
            {/* Total Balance */}
            <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
              <span className="text-lg font-bold text-gradient-gold">{currentBalance.toFixed(2)} Tokens</span>
            </div>
            
            {/* Locked Amount */}
            {userCreatedAt && availableBalance < currentBalance && (
              <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-red-400 block">Locked Amount</span>
                  <span className="text-xs text-muted-foreground">
                    Unlocks on {new Date(new Date(userCreatedAt).getTime() + lockDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-lg font-bold text-red-400">${(currentBalance - availableBalance).toFixed(2)}</span>
              </div>
            )}
            
            {/* Available Balance */}
            <div className="flex justify-between items-center p-3 bg-green-500/10 border-2 border-green-500/30 rounded-lg">
              <span className="text-sm font-medium text-green-400">Available to Withdraw</span>
              <span className="text-lg font-bold text-green-400">{availableBalance.toFixed(2)} Tokens</span>
            </div>
            
            {/* Withdraw Amount */}
            {withdrawAmount > 0 && (
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Withdraw</span>
                <span className="text-lg font-bold text-destructive">-{withdrawAmount.toFixed(2)} Tokens</span>
              </div>
            )}
            
            {/* Available After Withdrawal */}
            {withdrawAmount > 0 && (
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg border-2 border-primary/50">
                <span className="text-sm font-medium text-muted-foreground">Remaining After Withdrawal</span>
                <span className={`text-lg font-bold ${remainingBalance >= 0 ? 'text-gradient-gold' : 'text-destructive'}`}>
                  {remainingBalance.toFixed(2)} Tokens
                </span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-warning/20 border border-warning/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-warning">
              <span className="font-semibold">Note:</span> Minimum withdrawal: 10 USDT. ${lockAmount} is locked for {lockDays} days from account creation. Processing time: 24-48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Enter Wallet Address (BEP20)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <Input
              placeholder="Enter Amount (USDT)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Request Withdrawal'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;

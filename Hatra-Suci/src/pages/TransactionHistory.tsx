import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Gift, Calendar, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import BlockchainBackground from '@/components/BlockchainBackground';
import { userAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
}

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load transactions'
      });
    } finally {
      setLoading(false);
    }
  };

  const depositTransactions: Transaction[] = transactions
    .filter(tx => tx.type === 'deposit')
    .map(tx => ({
      id: tx._id,
      amount: tx.amount,
      date: new Date(tx.createdAt).toLocaleString(),
      status: tx.status,
      description: tx.description || 'Deposit'
    }));

  const withdrawTransactions: Transaction[] = transactions
    .filter(tx => tx.type === 'withdrawal')
    .map(tx => ({
      id: tx._id,
      amount: tx.amount,
      date: new Date(tx.createdAt).toLocaleString(),
      status: tx.status,
      description: tx.description || 'Withdrawal'
    }));

  const bonusTransactions: Transaction[] = transactions
    .filter(tx => ['bonus', 'referral', 'level_reward'].includes(tx.type))
    .map(tx => ({
      id: tx._id,
      amount: tx.amount,
      date: new Date(tx.createdAt).toLocaleString(),
      status: tx.status,
      description: tx.description || 'Bonus'
    }));

  const dailyRewardTransactions: Transaction[] = transactions
    .filter(tx => tx.type === 'daily_reward')
    .map(tx => ({
      id: tx._id,
      amount: tx.amount,
      date: new Date(tx.createdAt).toLocaleString(),
      status: tx.status,
      description: tx.description || 'Daily Reward'
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'failed':
        return 'bg-red-500/20 border-red-500/50';
      default:
        return 'bg-secondary/50 border-border';
    }
  };

  const TransactionList = ({ transactions, type }: { transactions: Transaction[], type: string }) => {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No {type} transactions yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusBadge(transaction.status)}`}>
                  {type === 'Deposit' && <ArrowDownToLine className="w-4 h-4 text-green-500" />}
                  {type === 'Withdraw' && <ArrowUpFromLine className="w-4 h-4 text-red-500" />}
                  {type === 'Bonus' && <Gift className="w-4 h-4 text-purple-500" />}
                  {type === 'Daily Reward' && <Calendar className="w-4 h-4 text-blue-500" />}
                </div>
                <div>
                  <p className="font-semibold text-sm">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${type === 'Withdraw' ? 'text-red-500' : 'text-green-500'}`}>
                  {type === 'Withdraw' ? '-' : '+'}{transaction.amount.toFixed(2)} Tokens
                </p>
                <p className={`text-xs font-medium uppercase ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
              <span>Transaction ID: {transaction.id}</span>
            </div>
          </Card>
        ))}
      </div>
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <BlockchainBackground />
        <div className="relative z-10 text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen relative">
      <BlockchainBackground />
      
      <div className="relative z-10 p-4 max-w-3xl mx-auto pb-20">
        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold flex-1 text-center pr-8">Transaction History</h1>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="bonus">Bonus</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <TransactionList transactions={depositTransactions} type="Deposit" />
          </TabsContent>

          <TabsContent value="withdraw">
            <TransactionList transactions={withdrawTransactions} type="Withdraw" />
          </TabsContent>

          <TabsContent value="bonus">
            <TransactionList transactions={bonusTransactions} type="Bonus" />
          </TabsContent>

          <TabsContent value="daily">
            <TransactionList transactions={dailyRewardTransactions} type="Daily Reward" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TransactionHistory;

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';

interface Transaction {
  _id: string;
  user: {
    username: string;
    email: string;
  };
  type: 'deposit' | 'withdrawal' | 'bonus' | 'referral' | 'daily_reward' | 'level_reward';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  description?: string;
}

const AdminTransactions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTransactions();
      setTransactions(response.data);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch transactions',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-5 h-5 text-red-500" />;
      case 'bonus':
      case 'referral':
      case 'daily_reward':
      case 'level_reward':
        return <Gift className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Deposit</Badge>;
      case 'withdrawal':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Withdrawal</Badge>;
      case 'bonus':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Bonus</Badge>;
      case 'referral':
        return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">Referral</Badge>;
      case 'daily_reward':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Daily Reward</Badge>;
      case 'level_reward':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Level Reward</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Calculate stats
  const depositCount = transactions.filter(tx => tx.type === 'deposit').length;
  const withdrawalCount = transactions.filter(tx => tx.type === 'withdrawal').length;
  const bonusCount = transactions.filter(tx => ['bonus', 'referral', 'daily_reward', 'level_reward'].includes(tx.type)).length;
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  if (loading) {
    return (
      <AdminLayout title="Transaction History">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Transaction History">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <h3 className="text-2xl font-bold mt-1">{transactions.length}</h3>
            </div>
            <Activity className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 backdrop-blur-sm border-2 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Deposits</p>
              <h3 className="text-2xl font-bold mt-1">{depositCount}</h3>
            </div>
            <ArrowDownCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-red-500/10 backdrop-blur-sm border-2 border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Withdrawals</p>
              <h3 className="text-2xl font-bold mt-1">{withdrawalCount}</h3>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4 bg-yellow-500/10 backdrop-blur-sm border-2 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bonuses</p>
              <h3 className="text-2xl font-bold mt-1">{bonusCount}</h3>
            </div>
            <Gift className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 bg-card/90 backdrop-blur-sm border-2 border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by username, email, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Type: {typeFilter === 'all' ? 'All' : typeFilter.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('deposit')}>Deposits</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('withdrawal')}>Withdrawals</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('bonus')}>Bonuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('referral')}>Referrals</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('daily_reward')}>Daily Rewards</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('level_reward')}>Level Rewards</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card className="p-12 text-center bg-card/90 backdrop-blur-sm border-2 border-border">
          <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || typeFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'No transactions yet'}
          </p>
        </Card>
      ) : (
        <Card className="bg-card/90 backdrop-blur-sm border-2 border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold">User</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Amount</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr 
                    key={tx._id} 
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-background/30' : ''}`}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{tx.user.username}</p>
                        <p className="text-xs text-muted-foreground">{tx.user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(tx.type)}
                        {getTypeBadge(tx.type)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${
                        tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'referral' || tx.type === 'daily_reward' || tx.type === 'level_reward'
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'referral' || tx.type === 'daily_reward' || tx.type === 'level_reward' ? '+' : '-'}
                        ${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {tx.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminTransactions;

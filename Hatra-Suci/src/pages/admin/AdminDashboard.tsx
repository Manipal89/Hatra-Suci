import { 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  UserCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingRegistrations: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user.isAdmin) {
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching dashboard data...');
      const [statsRes, transactionsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllTransactions()
      ]);

      console.log('Stats:', statsRes.data);
      console.log('Transactions:', transactionsRes.data);

      setStats(statsRes.data);
      
      // Get recent 10 transactions
      const recent = transactionsRes.data.slice(0, 10).map((tx: any) => ({
        id: tx._id || 'unknown',
        type: tx.type || 'unknown',
        user: tx.user?.username || 'Unknown',
        amount: tx.amount || 0,
        status: tx.status || 'pending',
        time: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'
      }));
      setRecentActivity(recent);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
      case 'signup':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved' || status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500 border border-green-500/30">
          <CheckCircle2 className="w-3 h-3" />
          {status === 'completed' ? 'Completed' : 'Approved'}
        </span>
      );
    }
    if (status === 'rejected' || status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-500 border border-red-500/30">
          <XCircle className="w-3 h-3" />
          {status === 'rejected' ? 'Rejected' : 'Cancelled'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  if (error && !loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Users */}
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</h3>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold mt-1">{stats.activeUsers.toLocaleString()}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        {/* Total Deposits */}
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <h3 className="text-2xl font-bold mt-1">${stats.totalDeposits.toLocaleString()}</h3>
              <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stats.pendingDeposits} pending
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/20">
              <ArrowDownCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Total Withdrawals */}
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              <h3 className="text-2xl font-bold mt-1">${stats.totalWithdrawals.toLocaleString()}</h3>
              <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {stats.pendingWithdrawals} pending
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent/20">
              <ArrowUpCircle className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Registration Verification Alert */}
      {stats.pendingRegistrations > 0 && (
        <Card className="p-4 bg-yellow-500/10 border-2 border-yellow-500/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-yellow-500">Pending Registration Verifications</h3>
                <p className="text-sm text-muted-foreground">{stats.pendingRegistrations} new registrations awaiting deposit verification</p>
              </div>
            </div>
            <Button onClick={() => navigate('/admin/registration-verification')} className="bg-yellow-500 hover:bg-yellow-600">
              Review Now
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start gap-3" 
              variant="outline"
              onClick={() => navigate('/admin/registration-verification')}
            >
              <UserCheck className="w-5 h-5 text-yellow-500" />
              <span>Registration Verification</span>
              {stats.pendingRegistrations > 0 && (
                <span className="ml-auto bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs">
                  {stats.pendingRegistrations}
                </span>
              )}
            </Button>
            <Button 
              className="w-full justify-start gap-3" 
              variant="outline"
              onClick={() => navigate('/admin/deposits')}
            >
              <ArrowDownCircle className="w-5 h-5 text-green-500" />
              <span>Review Deposits</span>
              {stats.pendingDeposits > 0 && (
                <span className="ml-auto bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs">
                  {stats.pendingDeposits}
                </span>
              )}
            </Button>
            <Button 
              className="w-full justify-start gap-3" 
              variant="outline"
              onClick={() => navigate('/admin/withdrawals')}
            >
              <ArrowUpCircle className="w-5 h-5 text-red-500" />
              <span>Process Withdrawals</span>
              <span className="ml-auto bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs">
                {stats.pendingWithdrawals}
              </span>
            </Button>
            <Button 
              className="w-full justify-start gap-3" 
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="w-5 h-5 text-blue-500" />
              <span>Manage Users</span>
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/transactions')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="p-2 rounded-lg bg-card">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.type === 'signup' ? 'New user registration' : 
                     activity.type === 'deposit' ? 'Deposit request' : 'Withdrawal request'}
                  </p>
                  <p className="text-xs text-muted-foreground">@{activity.user}</p>
                </div>
                {activity.amount && (
                  <p className={`text-sm font-semibold ${
                    activity.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {activity.type === 'withdrawal' ? '-' : '+'}${activity.amount}
                  </p>
                )}
                <div className="text-right">
                  {getStatusBadge(activity.status)}
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Registrations</p>
              <h3 className="text-xl font-bold">{stats.pendingRegistrations}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/20">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <h3 className="text-xl font-bold">${(stats.totalDeposits - stats.totalWithdrawals).toFixed(2)}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/20">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Deposit</p>
              <h3 className="text-xl font-bold">${stats.totalUsers > 0 ? (stats.totalDeposits / stats.totalUsers).toFixed(2) : '0.00'}</h3>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Calendar,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: number;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  referrals: number;
  level: number;
  joinDate: string;
  lastLogin: string;
  referredBy: string | null;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusData, setBonusData] = useState({ amount: '', description: '' });
  const [bonusLoading, setBonusLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllUsers();
      
      const formattedUsers = response.data.map((user: any, index: number) => ({
        id: index + 1,
        username: user.username,
        email: user.email,
        phone: user.phone || 'N/A',
        status: user.isActive ? 'active' : 'inactive',
        balance: user.balance || 0,
        totalDeposits: user.totalDeposits || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
        referrals: 0, // Will need to implement this count
        level: 1, // Will need to implement levels
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
        referredBy: null, // Can be added from referral data
        _id: user._id
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  };



  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500 border border-green-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-500 border border-red-500/30">
            <Ban className="w-3 h-3" />
            Banned
          </span>
        );
      default:
        return null;
    }
  };

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCreditBonus = (user: UserData) => {
    setSelectedUser(user);
    setBonusData({ amount: '', description: '' });
    setShowBonusModal(true);
  };

  const submitBonus = async () => {
    if (!selectedUser || !bonusData.amount || parseFloat(bonusData.amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a valid amount greater than 0'
      });
      return;
    }

    try {
      setBonusLoading(true);
      await adminAPI.creditBonus({
        userId: (selectedUser as any)._id,
        amount: parseFloat(bonusData.amount),
        description: bonusData.description || `Admin bonus: $${bonusData.amount}`
      });

      toast({
        title: 'Success',
        description: `Bonus of $${bonusData.amount} credited to ${selectedUser.username}`
      });

      setShowBonusModal(false);
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to credit bonus'
      });
    } finally {
      setBonusLoading(false);
    }
  };

  const handleBanUser = (user: UserData) => {
    toast({
      title: user.status === 'banned' ? 'User Unbanned' : 'User Banned',
      description: `${user.username} has been ${user.status === 'banned' ? 'unbanned' : 'banned'} successfully.`
    });
  };

  const handleActivateUser = (user: UserData) => {
    toast({
      title: 'User Activated',
      description: `${user.username} has been activated successfully.`
    });
  };

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && users.length === 0) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-semibold mb-2">Error Loading Users</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUsers}>Try Again</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      {/* Filters */}
      <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border card-glow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>Inactive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('banned')}>Banned</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-card/90 backdrop-blur-sm border-2 border-border card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Balance</th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Level</th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Referrals</th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Joined</th>
                <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-primary">${user.balance.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs font-medium">
                      Level {user.level}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{user.referrals}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">
                    {user.joinDate}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreditBonus(user)}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Credit Bonus
                        </DropdownMenuItem>
                        {user.status !== 'active' && (
                          <DropdownMenuItem onClick={() => handleActivateUser(user)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleBanUser(user)}
                          className={user.status === 'banned' ? 'text-green-500' : 'text-red-500'}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {user.status === 'banned' ? 'Unban User' : 'Ban User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">Page {currentPage}</span>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl bg-card border-2 border-border">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.username}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="font-semibold">${selectedUser.balance.toLocaleString()}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Referrals</p>
                  <p className="font-semibold">{selectedUser.referrals}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Total Deposits</p>
                  <p className="font-semibold">${selectedUser.totalDeposits.toLocaleString()}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <DollarSign className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Total Withdrawals</p>
                  <p className="font-semibold">${selectedUser.totalWithdrawals.toLocaleString()}</p>
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{selectedUser.joinDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Level:</span>
                  <span>Level {selectedUser.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Referred by:</span>
                  <span>{selectedUser.referredBy || 'Direct'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {selectedUser.status !== 'active' && (
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => {
                      handleActivateUser(selectedUser);
                      setShowUserModal(false);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Activate User
                  </Button>
                )}
                <Button 
                  variant={selectedUser.status === 'banned' ? 'default' : 'destructive'}
                  className="flex-1 gap-2"
                  onClick={() => {
                    handleBanUser(selectedUser);
                    setShowUserModal(false);
                  }}
                >
                  <Ban className="w-4 h-4" />
                  {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bonus Credit Dialog */}
      <Dialog open={showBonusModal} onOpenChange={setShowBonusModal}>
        <DialogContent className="max-w-md bg-card border-2 border-border">
          <DialogHeader>
            <DialogTitle>Credit Bonus to {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Current Balance:</span>
                <span className="text-lg font-semibold">${selectedUser.balance.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Bonus Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter amount"
                  value={bonusData.amount}
                  onChange={(e) => setBonusData({ ...bonusData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., Promotional bonus"
                  value={bonusData.description}
                  onChange={(e) => setBonusData({ ...bonusData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBonusModal(false)}
                  disabled={bonusLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={submitBonus}
                  disabled={bonusLoading || !bonusData.amount}
                >
                  <DollarSign className="w-4 h-4" />
                  {bonusLoading ? 'Processing...' : 'Credit Bonus'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;

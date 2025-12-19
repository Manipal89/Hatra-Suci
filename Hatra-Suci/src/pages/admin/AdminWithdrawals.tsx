import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  ArrowUpCircle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';

interface WithdrawalRequest {
  _id: string;
  user: {
    username: string;
    email: string;
  };
  amount: number;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  adminNotes?: string;
  transactionHash?: string;
}

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllWithdrawals();
      setWithdrawals(response.data);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch withdrawals',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (withdrawal: WithdrawalRequest, actionType: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setAction(actionType);
    setAdminNotes(withdrawal.adminNotes || '');
    setTransactionHash(withdrawal.transactionHash || '');
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedWithdrawal) return;

    try {
      setProcessing(true);
      await adminAPI.updateWithdrawal(selectedWithdrawal._id, {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes,
        transactionHash: action === 'approve' ? transactionHash : undefined,
      });

      toast({
        title: 'Success',
        description: `Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setShowActionDialog(false);
      fetchWithdrawals();
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process withdrawal',
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(id);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = 
      withdrawal.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (withdrawal.walletAddress && withdrawal.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const approvedCount = withdrawals.filter(w => w.status === 'approved').length;
  const rejectedCount = withdrawals.filter(w => w.status === 'rejected').length;

  if (loading) {
    return (
      <AdminLayout title="Withdrawal Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading withdrawals...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Withdrawal Management">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              <h3 className="text-2xl font-bold mt-1">{withdrawals.length}</h3>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 bg-yellow-500/10 backdrop-blur-sm border-2 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold mt-1">{pendingCount}</h3>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 backdrop-blur-sm border-2 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <h3 className="text-2xl font-bold mt-1">{approvedCount}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-red-500/10 backdrop-blur-sm border-2 border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <h3 className="text-2xl font-bold mt-1">{rejectedCount}</h3>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
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
                placeholder="Search by username, email, or wallet address..."
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
                Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('approved')}>Approved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Withdrawals List */}
      {filteredWithdrawals.length === 0 ? (
        <Card className="p-12 text-center bg-card/90 backdrop-blur-sm border-2 border-border">
          <ArrowUpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Withdrawals Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'No withdrawal requests yet'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWithdrawals.map((withdrawal) => (
            <Card key={withdrawal._id} className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <ArrowUpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{withdrawal.user.username}</h3>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{withdrawal.user.email}</p>
                    </div>
                  </div>

                  {/* Withdrawal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount</p>
                      <p className="text-lg font-bold text-primary">${withdrawal.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono truncate">{withdrawal.walletAddress}</p>
                        <button
                          onClick={() => copyToClipboard(withdrawal.walletAddress, withdrawal._id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copiedHash === withdrawal._id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {withdrawal.transactionHash && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono truncate">{withdrawal.transactionHash}</p>
                          <button
                            onClick={() => copyToClipboard(withdrawal.transactionHash!, `${withdrawal._id}-hash`)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {copiedHash === `${withdrawal._id}-hash` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Requested</p>
                      <p className="text-sm">{new Date(withdrawal.createdAt).toLocaleString()}</p>
                    </div>
                    {withdrawal.approvedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Processed</p>
                        <p className="text-sm">{new Date(withdrawal.approvedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {withdrawal.adminNotes && (
                      <div className="col-span-full">
                        <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                        <p className="text-sm">{withdrawal.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {withdrawal.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleAction(withdrawal, 'approve')}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={processing}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(withdrawal, 'reject')}
                      variant="destructive"
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'Enter the transaction hash for the completed withdrawal.'
                : 'This will reject the withdrawal request.'}
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="font-semibold">{selectedWithdrawal.user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${selectedWithdrawal.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Wallet:</span>
                  <span className="font-mono text-xs">{selectedWithdrawal.walletAddress}</span>
                </div>
              </div>

              {action === 'approve' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transaction Hash *</label>
                  <Input
                    placeholder="Enter the blockchain transaction hash..."
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this withdrawal..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={processing || (action === 'approve' && !transactionHash)}
              className={action === 'approve' ? 'bg-green-500 hover:bg-green-600' : ''}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              {processing ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {action === 'approve' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWithdrawals;

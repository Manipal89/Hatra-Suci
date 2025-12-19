import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  ArrowDownCircle,
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

interface DepositRequest {
  _id: string;
  user: {
    username: string;
    email: string;
  };
  amount: number;
  transactionHash: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  adminNotes?: string;
  isRegistrationDeposit?: boolean;
}

const AdminDeposits = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllDeposits();
      // Filter out registration deposits
      const regularDeposits = response.data.filter((d: DepositRequest) => !d.isRegistrationDeposit);
      setDeposits(regularDeposits);
    } catch (error: any) {
      console.error('Error fetching deposits:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch deposits',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (deposit: DepositRequest, actionType: 'approve' | 'reject') => {
    setSelectedDeposit(deposit);
    setAction(actionType);
    setAdminNotes(deposit.adminNotes || '');
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedDeposit) return;

    try {
      setProcessing(true);
      await adminAPI.updateDeposit(selectedDeposit._id, {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes,
      });

      toast({
        title: 'Success',
        description: `Deposit ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setShowActionDialog(false);
      fetchDeposits();
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process deposit',
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

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = 
      deposit.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.transactionHash.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    
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

  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const approvedCount = deposits.filter(d => d.status === 'approved').length;
  const rejectedCount = deposits.filter(d => d.status === 'rejected').length;

  if (loading) {
    return (
      <AdminLayout title="Deposit Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading deposits...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Deposit Management">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-2 border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <h3 className="text-2xl font-bold mt-1">{deposits.length}</h3>
            </div>
            <ArrowDownCircle className="w-8 h-8 text-primary" />
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
                placeholder="Search by username, email, or transaction hash..."
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

      {/* Deposits List */}
      {filteredDeposits.length === 0 ? (
        <Card className="p-12 text-center bg-card/90 backdrop-blur-sm border-2 border-border">
          <ArrowDownCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Deposits Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters'
              : 'No deposit requests yet'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDeposits.map((deposit) => (
            <Card key={deposit._id} className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <ArrowDownCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{deposit.user.username}</h3>
                        {getStatusBadge(deposit.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{deposit.user.email}</p>
                    </div>
                  </div>

                  {/* Deposit Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount</p>
                      <p className="text-lg font-bold text-primary">${deposit.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono truncate">{deposit.transactionHash}</p>
                        <button
                          onClick={() => copyToClipboard(deposit.transactionHash, deposit._id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copiedHash === deposit._id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                      <p className="text-sm font-mono truncate">{deposit.walletAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                      <p className="text-sm">{new Date(deposit.createdAt).toLocaleString()}</p>
                    </div>
                    {deposit.approvedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Processed</p>
                        <p className="text-sm">{new Date(deposit.approvedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {deposit.adminNotes && (
                      <div className="col-span-full">
                        <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                        <p className="text-sm">{deposit.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {deposit.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleAction(deposit, 'approve')}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={processing}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(deposit, 'reject')}
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
              {action === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'This will credit the deposit amount to the user\'s balance.'
                : 'This will reject the deposit and notify the user.'}
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-background/50 rounded-lg border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="font-semibold">{selectedDeposit.user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${selectedDeposit.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this verification..."
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
              disabled={processing}
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

export default AdminDeposits;

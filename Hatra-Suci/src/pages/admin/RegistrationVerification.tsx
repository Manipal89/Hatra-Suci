import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Eye, Activity, UserCheck, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface RegistrationDeposit {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    isActive: boolean;
  };
  amount: number;
  transactionHash: string;
  walletAddress: string;
  status: string;
  createdAt: string;
}

const RegistrationVerification = () => {
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<RegistrationDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<RegistrationDeposit | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingRegistrations();
      setDeposits(response.data);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch pending registrations',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (deposit: RegistrationDeposit, actionType: 'approve' | 'reject') => {
    setSelectedDeposit(deposit);
    setAction(actionType);
    setAdminNotes('');
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedDeposit) return;

    try {
      setProcessing(true);
      await adminAPI.verifyRegistrationDeposit(selectedDeposit._id, {
        status: action === 'approve' ? 'approved' : 'rejected',
        adminNotes,
      });

      toast({
        title: 'Success',
        description: `Registration ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setShowDialog(false);
      fetchPendingRegistrations();
    } catch (error: any) {
      console.error('Error processing registration:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process registration',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Registration Verification">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading pending registrations...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Registration Verification">
      {/* Header Stats */}
      <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pending Registration Verifications</h2>
            <p className="text-muted-foreground mt-1">
              Review and approve new user registrations with deposit confirmation
            </p>
          </div>
          <div className="text-center px-6 py-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
            <div className="text-3xl font-bold text-yellow-500">{deposits.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </div>
      </Card>

      {/* Registration List */}
      {deposits.length === 0 ? (
        <Card className="p-12 text-center bg-card/90 backdrop-blur-sm border-2 border-border">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Pending Registrations</h3>
          <p className="text-muted-foreground">All registration deposits have been verified</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deposits.map((deposit) => (
            <Card key={deposit._id} className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* User Info */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold">{deposit.user.username}</h3>
                        <Badge variant="outline" className="text-xs">
                          New Registration
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{deposit.user.email}</p>
                    </div>
                  </div>

                  {/* Deposit Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deposit Amount</p>
                      <p className="text-lg font-bold text-primary">${deposit.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                      <p className="text-sm font-mono truncate">{deposit.transactionHash}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                      <p className="text-sm font-mono truncate">{deposit.walletAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                      <p className="text-sm">{new Date(deposit.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Warning if insufficient amount */}
                  {deposit.amount < 60 && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-500">
                        Deposit amount is below minimum requirement ($60)
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'This will activate the user account and credit the deposit amount to their balance.'
                : 'This will reject the registration and notify the user.'}
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
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={processing}>
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

export default RegistrationVerification;

import { useState, useEffect } from 'react';
import { DollarSign, Gift, User, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';

interface UserOption {
  _id: string;
  username: string;
  email: string;
  balance: number;
}

const AdminBonus = () => {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users list'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const user = users.find(u => u._id === userId);
    setSelectedUser(user || null);
    setFormData({ ...formData, userId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.userId) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please select a user'
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0'
      });
      return;
    }

    try {
      setSubmitting(true);
      await adminAPI.creditBonus({
        userId: formData.userId,
        amount,
        description: formData.description || `Admin bonus: $${amount.toFixed(2)}`
      });

      toast({
        title: 'Bonus Credited',
        description: `Successfully credited $${amount.toFixed(2)} to ${selectedUser?.username}`
      });

      // Reset form
      setFormData({ userId: '', amount: '', description: '' });
      setSelectedUser(null);
      
      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to credit bonus'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Credit Bonus">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Credit Bonus to User</h2>
              <p className="text-sm text-muted-foreground">
                Add bonus credits directly to a user's balance
              </p>
            </div>
          </div>
        </Card>

        {/* Bonus Form */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Select User
              </Label>
              <select
                value={formData.userId}
                onChange={handleUserSelect}
                disabled={loading || submitting}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                required
              >
                <option value="">-- Select a user --</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username} ({user.email}) - Balance: ${user.balance?.toFixed(2) || '0.00'}
                  </option>
                ))}
              </select>
            </div>

            {/* User Info Display */}
            {selectedUser && (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Username:</span>
                    <p className="font-medium">{selectedUser.username}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <p className="text-lg font-semibold text-primary">
                      ${selectedUser.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4" />
                Bonus Amount ($)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount (e.g., 10.00)"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={submitting}
                required
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Minimum: $0.01 - This amount will be added to the user's balance
              </p>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Description (Optional)
              </Label>
              <Textarea
                placeholder="Enter bonus reason or description (e.g., Promotional bonus, Compensation, etc.)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={submitting}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                If left empty, default description will be used
              </p>
            </div>

            {/* Preview */}
            {formData.amount && parseFloat(formData.amount) > 0 && selectedUser && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">User:</span>{' '}
                    <span className="font-medium">{selectedUser.username}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Current Balance:</span>{' '}
                    <span className="font-medium">${selectedUser.balance?.toFixed(2) || '0.00'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Bonus Amount:</span>{' '}
                    <span className="font-medium text-green-500">+${parseFloat(formData.amount).toFixed(2)}</span>
                  </p>
                  <p className="text-sm font-semibold">
                    <span className="text-muted-foreground">New Balance:</span>{' '}
                    <span className="text-primary">
                      ${((selectedUser.balance || 0) + parseFloat(formData.amount)).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({ userId: '', amount: '', description: '' });
                  setSelectedUser(null);
                }}
                disabled={submitting}
                className="flex-1"
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.userId || !formData.amount}
                className="flex-1 gap-2"
              >
                <Gift className="w-4 h-4" />
                {submitting ? 'Processing...' : 'Credit Bonus'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Information Card */}
        <Card className="p-4 bg-muted/30 backdrop-blur-sm border border-border">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Important Notes
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Bonus amounts are added immediately to the user's balance</li>
            <li>A transaction record will be created with type "bonus"</li>
            <li>The transaction will be marked as completed and linked to your admin account</li>
            <li>Users can see bonus transactions in their transaction history</li>
            <li>This action cannot be undone - please verify the amount before submitting</li>
          </ul>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBonus;

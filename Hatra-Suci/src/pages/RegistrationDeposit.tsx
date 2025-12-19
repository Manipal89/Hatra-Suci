import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/api';
import BlockchainBackground from '@/components/BlockchainBackground';

const MINIMUM_DEPOSIT = 60;

export default function RegistrationDeposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState('Loading...');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [formData, setFormData] = useState({
    transactionHash: '',
    amount: '',
  });

  const userData = location.state?.user;

  useEffect(() => {
    if (!userData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please complete registration first',
      });
      navigate('/register');
    }

    // Fetch wallet address
    const fetchWalletAddress = async () => {
      try {
        const response = await authAPI.getPublicSettings();
        setWalletAddress(response.data.depositWallet);
        setQrCodeUrl(response.data.depositQrUrl || '');
      } catch (error) {
        console.error('Failed to fetch wallet address:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load wallet address',
        });
      }
    };
    fetchWalletAddress();
  }, [userData, navigate, toast]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy wallet address',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.transactionHash || !formData.amount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields',
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount < MINIMUM_DEPOSIT) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Minimum deposit amount is $${MINIMUM_DEPOSIT}`,
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.submitRegistrationDeposit({
        userId: userData._id,
        transactionHash: formData.transactionHash,
        amount: amount,
      });

      toast({
        title: 'Success!',
        description: 'Registration deposit submitted. Please wait for admin verification.',
      });

      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Your registration deposit is being verified. You will be notified once approved.' 
          } 
        });
      }, 2000);
    } catch (error: any) {
      console.error('Deposit submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit deposit',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <BlockchainBackground />
      
      <div className="relative z-10 p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/register')}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Registration Deposit
          </h1>
          <p className="text-gray-400">
            Complete your registration with a minimum deposit of ${MINIMUM_DEPOSIT}
          </p>
        </div>

        {/* Deposit Form Card */}
        <div className="backdrop-blur-sm bg-black/40 rounded-2xl border-2 border-primary/50 p-6 md:p-8 shadow-2xl shadow-primary/20">
          <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/50">
            <AlertDescription className="text-yellow-200">
              <strong>Note:</strong> 1 Token = 1 USDT. Minimum deposit: ${MINIMUM_DEPOSIT}
            </AlertDescription>
          </Alert>

          {/* QR Code Section */}
          <div className="mb-8 text-center">
            <h3 className="text-lg font-semibold mb-4">Scan QR Code to Deposit</h3>
            <div className="inline-block p-4 bg-white rounded-lg">
              <div className="w-48 h-48 flex items-center justify-center">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Deposit QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    <p>No QR Code available</p>
                    <p className="text-xs mt-1">Use wallet address below</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="mb-6">
            <Label className="text-sm text-gray-400 mb-2 block">
              Wallet Address (USDT BEP20)
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/60 border border-primary/30 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono overflow-x-auto">
                {walletAddress}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className={`border-primary/50 ${copied ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Deposit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="transactionHash" className="text-white mb-2 block">
                Enter Transaction Hash (TxID) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transactionHash"
                type="text"
                placeholder="0x..."
                value={formData.transactionHash}
                onChange={(e) => setFormData({ ...formData, transactionHash: e.target.value })}
                required
                className="bg-black/60 border-primary/30 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-white mb-2 block">
                Enter Amount (USDT) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min={MINIMUM_DEPOSIT}
                step="0.01"
                placeholder={`Minimum ${MINIMUM_DEPOSIT} USDT`}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="bg-black/60 border-primary/30 text-white placeholder:text-gray-500"
              />
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/50">
              <AlertDescription className="text-blue-200 text-sm">
                After submitting, your deposit will be verified by our admin team. 
                You will receive a notification once your account is activated.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-6 text-lg"
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Having issues? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

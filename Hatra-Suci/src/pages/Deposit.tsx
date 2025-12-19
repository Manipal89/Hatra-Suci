import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlockchainBackground from '@/components/BlockchainBackground';
import { toast } from '@/hooks/use-toast';
import { userAPI, authAPI } from '@/services/api';

const Deposit = () => {
  const navigate = useNavigate();
  const [txHash, setTxHash] = useState('');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('0x1ab174ddf2fb97bd3cf3362a98b103a6f3852a67');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const response = await authAPI.getPublicSettings();
        setWalletAddress(response.data.depositWallet);
        setQrCodeUrl(response.data.depositQrUrl || '');
      } catch (error) {
        console.error('Failed to fetch wallet address:', error);
      }
    };
    fetchWalletAddress();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({ title: 'Address copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!txHash || !amount) {
      toast({ 
        title: 'Missing Information',
        description: 'Please provide transaction hash and amount.',
        variant: 'destructive'
      });
      return;
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      toast({ 
        title: 'Invalid Amount',
        description: 'Amount must be greater than 0.',
        variant: 'destructive'
      });
      return;
    }

    if (depositAmount < 10) {
      toast({ 
        title: 'Below Minimum',
        description: 'Minimum deposit amount is 10 USDT.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await userAPI.createDeposit({
        transactionHash: txHash,
        amount: depositAmount,
        walletAddress: walletAddress
      });

      toast({ 
        title: 'Deposit Submitted', 
        description: 'Your deposit is pending approval.' 
      });

      // Clear form
      setTxHash('');
      setAmount('');

      // Optionally navigate to transaction history
      setTimeout(() => {
        navigate('/transactions');
      }, 2000);
    } catch (error: any) {
      toast({ 
        title: 'Deposit Failed',
        description: error.response?.data?.message || 'Failed to submit deposit.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
          <h1 className="text-xl font-semibold flex-1 text-center pr-8">Deposit USDT (BEP20)</h1>
        </header>

        {/* QR Code & Address */}
        <div className="border-2 border-border rounded-xl bg-card/90 backdrop-blur-sm p-6 mb-4 card-glow">
          <p className="text-center text-sm text-muted-foreground mb-3">Scan QR Code to Deposit</p>
          
          {/* QR Code */}
          <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg p-3 flex items-center justify-center">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="Deposit QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <p>No QR Code available</p>
                <p className="text-xs mt-1">Please use wallet address below</p>
              </div>
            )}
          </div>

          {/* Original SVG QR Code - kept as fallback 
          <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg p-3 flex items-center justify-center">
            <svg
              viewBox="0 0 29 29"
              className="w-full h-full"
              style={{ shapeRendering: 'crispEdges' }}
            >
              QR Code pattern - represents the wallet address
              <rect width="29" height="29" fill="#ffffff"/>
              Positioning markers (corners)
              <rect x="0" y="0" width="7" height="7" fill="#000000"/>
              <rect x="1" y="1" width="5" height="5" fill="#ffffff"/>
              <rect x="2" y="2" width="3" height="3" fill="#000000"/>
              
              <rect x="22" y="0" width="7" height="7" fill="#000000"/>
              <rect x="23" y="1" width="5" height="5" fill="#ffffff"/>
              <rect x="24" y="2" width="3" height="3" fill="#000000"/>
              
              <rect x="0" y="22" width="7" height="7" fill="#000000"/>
              <rect x="1" y="23" width="5" height="5" fill="#ffffff"/>
              <rect x="2" y="24" width="3" height="3" fill="#000000"/>
              
              Data pattern - sample QR code pattern
              <rect x="8" y="0" width="1" height="1" fill="#000000"/>
              <rect x="10" y="0" width="1" height="1" fill="#000000"/>
              <rect x="12" y="0" width="1" height="1" fill="#000000"/>
              <rect x="14" y="0" width="1" height="1" fill="#000000"/>
              <rect x="16" y="0" width="1" height="1" fill="#000000"/>
              <rect x="18" y="0" width="1" height="1" fill="#000000"/>
              <rect x="20" y="0" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="1" width="1" height="1" fill="#000000"/>
              <rect x="11" y="1" width="1" height="1" fill="#000000"/>
              <rect x="13" y="1" width="1" height="1" fill="#000000"/>
              <rect x="15" y="1" width="1" height="1" fill="#000000"/>
              <rect x="17" y="1" width="1" height="1" fill="#000000"/>
              <rect x="19" y="1" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="2" width="1" height="1" fill="#000000"/>
              <rect x="12" y="2" width="1" height="1" fill="#000000"/>
              <rect x="14" y="2" width="1" height="1" fill="#000000"/>
              <rect x="16" y="2" width="1" height="1" fill="#000000"/>
              <rect x="18" y="2" width="1" height="1" fill="#000000"/>
              <rect x="20" y="2" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="3" width="1" height="1" fill="#000000"/>
              <rect x="10" y="3" width="1" height="1" fill="#000000"/>
              <rect x="13" y="3" width="1" height="1" fill="#000000"/>
              <rect x="15" y="3" width="1" height="1" fill="#000000"/>
              <rect x="17" y="3" width="1" height="1" fill="#000000"/>
              <rect x="19" y="3" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="4" width="1" height="1" fill="#000000"/>
              <rect x="11" y="4" width="1" height="1" fill="#000000"/>
              <rect x="14" y="4" width="1" height="1" fill="#000000"/>
              <rect x="16" y="4" width="1" height="1" fill="#000000"/>
              <rect x="18" y="4" width="1" height="1" fill="#000000"/>
              <rect x="20" y="4" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="5" width="1" height="1" fill="#000000"/>
              <rect x="12" y="5" width="1" height="1" fill="#000000"/>
              <rect x="15" y="5" width="1" height="1" fill="#000000"/>
              <rect x="17" y="5" width="1" height="1" fill="#000000"/>
              <rect x="19" y="5" width="1" height="1" fill="#000000"/>
              
              <rect x="10" y="6" width="1" height="1" fill="#000000"/>
              <rect x="13" y="6" width="1" height="1" fill="#000000"/>
              <rect x="16" y="6" width="1" height="1" fill="#000000"/>
              <rect x="18" y="6" width="1" height="1" fill="#000000"/>
              <rect x="20" y="6" width="1" height="1" fill="#000000"/>
              
              Timing patterns
              <rect x="8" y="8" width="1" height="1" fill="#000000"/>
              <rect x="10" y="8" width="1" height="1" fill="#000000"/>
              <rect x="12" y="8" width="1" height="1" fill="#000000"/>
              <rect x="14" y="8" width="1" height="1" fill="#000000"/>
              <rect x="16" y="8" width="1" height="1" fill="#000000"/>
              <rect x="18" y="8" width="1" height="1" fill="#000000"/>
              <rect x="20" y="8" width="1" height="1" fill="#000000"/>
              
              More data pattern
              <rect x="0" y="8" width="1" height="1" fill="#000000"/>
              <rect x="2" y="8" width="1" height="1" fill="#000000"/>
              <rect x="4" y="8" width="1" height="1" fill="#000000"/>
              <rect x="6" y="8" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="9" width="1" height="1" fill="#000000"/>
              <rect x="11" y="9" width="1" height="1" fill="#000000"/>
              <rect x="14" y="9" width="1" height="1" fill="#000000"/>
              <rect x="17" y="9" width="1" height="1" fill="#000000"/>
              <rect x="20" y="9" width="1" height="1" fill="#000000"/>
              <rect x="24" y="9" width="1" height="1" fill="#000000"/>
              <rect x="27" y="9" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="10" width="1" height="1" fill="#000000"/>
              <rect x="12" y="10" width="1" height="1" fill="#000000"/>
              <rect x="15" y="10" width="1" height="1" fill="#000000"/>
              <rect x="18" y="10" width="1" height="1" fill="#000000"/>
              <rect x="22" y="10" width="1" height="1" fill="#000000"/>
              <rect x="25" y="10" width="1" height="1" fill="#000000"/>
              <rect x="28" y="10" width="1" height="1" fill="#000000"/>
              
              <rect x="10" y="11" width="1" height="1" fill="#000000"/>
              <rect x="13" y="11" width="1" height="1" fill="#000000"/>
              <rect x="16" y="11" width="1" height="1" fill="#000000"/>
              <rect x="19" y="11" width="1" height="1" fill="#000000"/>
              <rect x="23" y="11" width="1" height="1" fill="#000000"/>
              <rect x="26" y="11" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="12" width="1" height="1" fill="#000000"/>
              <rect x="11" y="12" width="1" height="1" fill="#000000"/>
              <rect x="14" y="12" width="1" height="1" fill="#000000"/>
              <rect x="17" y="12" width="1" height="1" fill="#000000"/>
              <rect x="20" y="12" width="1" height="1" fill="#000000"/>
              <rect x="24" y="12" width="1" height="1" fill="#000000"/>
              <rect x="27" y="12" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="13" width="1" height="1" fill="#000000"/>
              <rect x="12" y="13" width="1" height="1" fill="#000000"/>
              <rect x="15" y="13" width="1" height="1" fill="#000000"/>
              <rect x="18" y="13" width="1" height="1" fill="#000000"/>
              <rect x="22" y="13" width="1" height="1" fill="#000000"/>
              <rect x="25" y="13" width="1" height="1" fill="#000000"/>
              <rect x="28" y="13" width="1" height="1" fill="#000000"/>
              
              <rect x="10" y="14" width="1" height="1" fill="#000000"/>
              <rect x="13" y="14" width="1" height="1" fill="#000000"/>
              <rect x="16" y="14" width="1" height="1" fill="#000000"/>
              <rect x="19" y="14" width="1" height="1" fill="#000000"/>
              <rect x="23" y="14" width="1" height="1" fill="#000000"/>
              <rect x="26" y="14" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="15" width="1" height="1" fill="#000000"/>
              <rect x="11" y="15" width="1" height="1" fill="#000000"/>
              <rect x="14" y="15" width="1" height="1" fill="#000000"/>
              <rect x="17" y="15" width="1" height="1" fill="#000000"/>
              <rect x="20" y="15" width="1" height="1" fill="#000000"/>
              <rect x="24" y="15" width="1" height="1" fill="#000000"/>
              <rect x="27" y="15" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="16" width="1" height="1" fill="#000000"/>
              <rect x="12" y="16" width="1" height="1" fill="#000000"/>
              <rect x="15" y="16" width="1" height="1" fill="#000000"/>
              <rect x="18" y="16" width="1" height="1" fill="#000000"/>
              <rect x="22" y="16" width="1" height="1" fill="#000000"/>
              <rect x="25" y="16" width="1" height="1" fill="#000000"/>
              <rect x="28" y="16" width="1" height="1" fill="#000000"/>
              
              <rect x="10" y="17" width="1" height="1" fill="#000000"/>
              <rect x="13" y="17" width="1" height="1" fill="#000000"/>
              <rect x="16" y="17" width="1" height="1" fill="#000000"/>
              <rect x="19" y="17" width="1" height="1" fill="#000000"/>
              <rect x="23" y="17" width="1" height="1" fill="#000000"/>
              <rect x="26" y="17" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="18" width="1" height="1" fill="#000000"/>
              <rect x="11" y="18" width="1" height="1" fill="#000000"/>
              <rect x="14" y="18" width="1" height="1" fill="#000000"/>
              <rect x="17" y="18" width="1" height="1" fill="#000000"/>
              <rect x="20" y="18" width="1" height="1" fill="#000000"/>
              <rect x="24" y="18" width="1" height="1" fill="#000000"/>
              <rect x="27" y="18" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="19" width="1" height="1" fill="#000000"/>
              <rect x="12" y="19" width="1" height="1" fill="#000000"/>
              <rect x="15" y="19" width="1" height="1" fill="#000000"/>
              <rect x="18" y="19" width="1" height="1" fill="#000000"/>
              <rect x="22" y="19" width="1" height="1" fill="#000000"/>
              <rect x="25" y="19" width="1" height="1" fill="#000000"/>
              <rect x="28" y="19" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="20" width="1" height="1" fill="#000000"/>
              <rect x="10" y="20" width="1" height="1" fill="#000000"/>
              <rect x="12" y="20" width="1" height="1" fill="#000000"/>
              <rect x="14" y="20" width="1" height="1" fill="#000000"/>
              <rect x="16" y="20" width="1" height="1" fill="#000000"/>
              <rect x="18" y="20" width="1" height="1" fill="#000000"/>
              <rect x="20" y="20" width="1" height="1" fill="#000000"/>
              <rect x="23" y="20" width="1" height="1" fill="#000000"/>
              <rect x="26" y="20" width="1" height="1" fill="#000000"/>
              
              Bottom area patterns
              <rect x="8" y="22" width="1" height="1" fill="#000000"/>
              <rect x="11" y="22" width="1" height="1" fill="#000000"/>
              <rect x="14" y="22" width="1" height="1" fill="#000000"/>
              <rect x="17" y="22" width="1" height="1" fill="#000000"/>
              <rect x="20" y="22" width="1" height="1" fill="#000000"/>
              <rect x="24" y="22" width="1" height="1" fill="#000000"/>
              <rect x="27" y="22" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="23" width="1" height="1" fill="#000000"/>
              <rect x="12" y="23" width="1" height="1" fill="#000000"/>
              <rect x="15" y="23" width="1" height="1" fill="#000000"/>
              <rect x="18" y="23" width="1" height="1" fill="#000000"/>
              <rect x="22" y="23" width="1" height="1" fill="#000000"/>
              <rect x="25" y="23" width="1" height="1" fill="#000000"/>
              <rect x="28" y="23" width="1" height="1" fill="#000000"/>
              
              <rect x="10" y="24" width="1" height="1" fill="#000000"/>
              <rect x="13" y="24" width="1" height="1" fill="#000000"/>
              <rect x="16" y="24" width="1" height="1" fill="#000000"/>
              <rect x="19" y="24" width="1" height="1" fill="#000000"/>
              <rect x="23" y="24" width="1" height="1" fill="#000000"/>
              <rect x="26" y="24" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="25" width="1" height="1" fill="#000000"/>
              <rect x="11" y="25" width="1" height="1" fill="#000000"/>
              <rect x="14" y="25" width="1" height="1" fill="#000000"/>
              <rect x="17" y="25" width="1" height="1" fill="#000000"/>
              <rect x="20" y="25" width="1" height="1" fill="#000000"/>
              <rect x="24" y="25" width="1" height="1" fill="#000000"/>
              <rect x="27" y="25" width="1" height="1" fill="#000000"/>
              
              <rect x="9" y="26" width="1" height="1" fill="#000000"/>
              <rect x="12" y="26" width="1" height="1" fill="#000000"/>
              <rect x="15" y="26" width="1" height="1" fill="#000000"/>
              <rect x="18" y="26" width="1" height="1" fill="#000000"/>
              <rect x="22" y="26" width="1" height="1" fill="#000000"/>
              <rect x="25" y="26" width="1" height="1" fill="#000000"/>
              <rect x="28" y="26" width="1" height="1" fill="#000000"/>
              
              <rect x="10" y="27" width="1" height="1" fill="#000000"/>
              <rect x="13" y="27" width="1" height="1" fill="#000000"/>
              <rect x="16" y="27" width="1" height="1" fill="#000000"/>
              <rect x="19" y="27" width="1" height="1" fill="#000000"/>
              <rect x="23" y="27" width="1" height="1" fill="#000000"/>
              <rect x="26" y="27" width="1" height="1" fill="#000000"/>
              
              <rect x="8" y="28" width="1" height="1" fill="#000000"/>
              <rect x="11" y="28" width="1" height="1" fill="#000000"/>
              <rect x="14" y="28" width="1" height="1" fill="#000000"/>
              <rect x="17" y="28" width="1" height="1" fill="#000000"/>
              <rect x="20" y="28" width="1" height="1" fill="#000000"/>
              <rect x="24" y="28" width="1" height="1" fill="#000000"/>
              <rect x="27" y="28" width="1" height="1" fill="#000000"/>
            </svg>
          </div> */}

          {/* Wallet Address */}
          <div className="flex items-center gap-2 bg-input rounded-lg p-3 border border-border">
            <span className="flex-1 text-sm font-mono truncate">{walletAddress}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-1">Copy</span>
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="border-2 border-border rounded-xl bg-card/90 backdrop-blur-sm p-6 card-glow">
          {/* Warning */}
          <div className="bg-warning/20 border border-warning/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-warning">
              <span className="font-semibold">Note:</span> 1 Token = 1 USDT.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Enter Transaction Hash (TxID)"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
            <Input
              placeholder="Enter Amount (USDT)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button variant="primary" size="lg" className="w-full">
              Submit for Approval
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Deposit;

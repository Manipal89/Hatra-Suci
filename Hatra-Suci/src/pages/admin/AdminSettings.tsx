import { useState, useEffect } from 'react';
import { 
  Save,
  Wallet,
  DollarSign,
  Percent,
  Bell,
  Shield,
  Globe,
  Copy,
  Check,
  Gift,
  Upload,
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';

const AdminSettings = () => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Platform settings state
  const [settings, setSettings] = useState({
    // Wallet Settings
    depositWallet: '0x1ab174ddf2fb97bd3cf3362a98b103a6f3852a67',
    depositQrUrl: '',
    
    // Token Settings
    conversionRate: 90,
    minDeposit: 10,
    maxDeposit: 50000,
    minWithdraw: 5,
    maxWithdraw: 10000,
    
    // Withdrawal Lock Settings
    withdrawLockAmount: 65,
    withdrawLockDays: 90,
    
    // Daily Reward Settings
    minDailyReward: 0.50,
    maxDailyReward: 0.80,
    
    // Referral Settings
    referralBonus: 5,
    
    // Platform Settings
    maintenanceMode: false,
    newRegistrations: true,
    withdrawalsEnabled: true,
    depositsEnabled: true,
    
    // Notification Settings
    emailNotifications: true,
    telegramNotifications: true,
    
    // Company Info
    supportEmail: 'support@hatrasuci.co.id',
    telegramSupport: '@HatraSuciSupport',
    companyPhone: '+62 21 3192 xxxx',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      
      // Map settings array to object
      const settingsMap: any = {};
      response.data.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });

      // Merge with defaults
      setSettings(prev => ({
        ...prev,
        ...settingsMap
      }));
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load settings. Using defaults.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWallet = async () => {
    await navigator.clipboard.writeText(settings.depositWallet);
    setCopied(true);
    toast({ title: 'Wallet address copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQrUpload = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please select an image file.'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.'
        });
        return;
      }

      try {
        setUploading(true);
        
        // Convert image to base64 data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          updateSetting('depositQrUrl', dataUrl);
          toast({
            title: 'QR Code Uploaded',
            description: 'QR code image loaded. Click Save to apply changes.'
          });
        };
        reader.onerror = () => {
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Failed to read the image file.'
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'An error occurred while uploading the image.'
        });
      } finally {
        setUploading(false);
      }
    };

    input.click();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save each setting
      const settingsToSave = [
        { key: 'depositWallet', value: settings.depositWallet, description: 'Deposit wallet address' },
        { key: 'depositQrUrl', value: settings.depositQrUrl, description: 'Deposit QR code URL' },
        { key: 'conversionRate', value: settings.conversionRate, description: 'Token conversion rate' },
        { key: 'minDeposit', value: settings.minDeposit, description: 'Minimum deposit amount' },
        { key: 'maxDeposit', value: settings.maxDeposit, description: 'Maximum deposit amount' },
        { key: 'minWithdraw', value: settings.minWithdraw, description: 'Minimum withdrawal amount' },
        { key: 'maxWithdraw', value: settings.maxWithdraw, description: 'Maximum withdrawal amount' },
        { key: 'withdrawLockAmount', value: settings.withdrawLockAmount, description: 'Withdrawal lock amount' },
        { key: 'withdrawLockDays', value: settings.withdrawLockDays, description: 'Withdrawal lock days' },
        { key: 'minDailyReward', value: settings.minDailyReward, description: 'Minimum daily reward' },
        { key: 'maxDailyReward', value: settings.maxDailyReward, description: 'Maximum daily reward' },
        { key: 'referralBonus', value: settings.referralBonus, description: 'Referral bonus percentage' },
        { key: 'maintenanceMode', value: settings.maintenanceMode, description: 'Maintenance mode status' },
        { key: 'newRegistrations', value: settings.newRegistrations, description: 'New registrations enabled' },
        { key: 'withdrawalsEnabled', value: settings.withdrawalsEnabled, description: 'Withdrawals enabled' },
        { key: 'depositsEnabled', value: settings.depositsEnabled, description: 'Deposits enabled' },
        { key: 'emailNotifications', value: settings.emailNotifications, description: 'Email notifications enabled' },
        { key: 'telegramNotifications', value: settings.telegramNotifications, description: 'Telegram notifications enabled' },
        { key: 'supportEmail', value: settings.supportEmail, description: 'Support email address' },
        { key: 'telegramSupport', value: settings.telegramSupport, description: 'Telegram support handle' },
        { key: 'companyPhone', value: settings.companyPhone, description: 'Company phone number' },
      ];

      // Save settings one by one
      for (const setting of settingsToSave) {
        await adminAPI.updateSettings(setting);
      }

      toast({
        title: 'Settings Saved',
        description: 'Platform settings have been updated successfully.'
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout title="Platform Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Sticky Save Bar */}
        <div className="sticky top-4 z-10 bg-card/95 backdrop-blur-sm border-2 border-primary/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Platform Settings</h3>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading settings...' : 'Make changes and save to apply'}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              className="gap-2 min-w-[140px]" 
              variant="gold" 
              disabled={saving || loading}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Wallet Settings */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Wallet Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Deposit Wallet Address (BEP20)</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={settings.depositWallet}
                  onChange={(e) => updateSetting('depositWallet', e.target.value)}
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopyWallet}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">This is the wallet address displayed to users for deposits.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Deposit QR Code URL</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={settings.depositQrUrl}
                  onChange={(e) => updateSetting('depositQrUrl', e.target.value)}
                  placeholder="https://example.com/qr-code.png or upload an image"
                  className="text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  title="Upload QR"
                  onClick={handleQrUpload}
                  disabled={uploading}
                >
                  <Upload className={`w-4 h-4 ${uploading ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a URL or click Upload to select an image file. Users will see this QR code on deposit pages.
              </p>
            </div>
          </div>
        </Card>

        {/* Token Settings */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/20">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">Token & Amount Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">INR to USD Rate</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={settings.conversionRate}
                  onChange={(e) => updateSetting('conversionRate', Number(e.target.value))}
                />
                <span className="text-muted-foreground">INR = 1 USD</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Referral Bonus (%)</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={settings.referralBonus}
                  onChange={(e) => updateSetting('referralBonus', Number(e.target.value))}
                />
                <Percent className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Min Deposit (USDT)</label>
              <Input
                type="number"
                value={settings.minDeposit}
                onChange={(e) => updateSetting('minDeposit', Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Max Deposit (USDT)</label>
              <Input
                type="number"
                value={settings.maxDeposit}
                onChange={(e) => updateSetting('maxDeposit', Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Min Withdrawal (USDT)</label>
              <Input
                type="number"
                value={settings.minWithdraw}
                onChange={(e) => updateSetting('minWithdraw', Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Max Withdrawal (USDT)</label>
              <Input
                type="number"
                value={settings.maxWithdraw}
                onChange={(e) => updateSetting('maxWithdraw', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Withdrawal Lock Amount (USD)</label>
              <Input
                type="number"
                value={settings.withdrawLockAmount}
                onChange={(e) => updateSetting('withdrawLockAmount', Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Amount locked from withdrawal for new accounts</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Withdrawal Lock Days</label>
              <Input
                type="number"
                value={settings.withdrawLockDays}
                onChange={(e) => updateSetting('withdrawLockDays', Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Days to lock the amount from account creation</p>
            </div>
          </div>
        </Card>

        {/* Daily Reward Settings */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Gift className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold">Daily Reward (Scratch Card)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Min Reward (Tokens)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.minDailyReward}
                onChange={(e) => updateSetting('minDailyReward', Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Max Reward (Tokens)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.maxDailyReward}
                onChange={(e) => updateSetting('maxDailyReward', Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Platform Controls */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold">Platform Controls</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Disable all user access temporarily</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">New Registrations</p>
                <p className="text-sm text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch
                checked={settings.newRegistrations}
                onCheckedChange={(checked) => updateSetting('newRegistrations', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Deposits Enabled</p>
                <p className="text-sm text-muted-foreground">Allow users to make deposits</p>
              </div>
              <Switch
                checked={settings.depositsEnabled}
                onCheckedChange={(checked) => updateSetting('depositsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Withdrawals Enabled</p>
                <p className="text-sm text-muted-foreground">Allow users to withdraw funds</p>
              </div>
              <Switch
                checked={settings.withdrawalsEnabled}
                onCheckedChange={(checked) => updateSetting('withdrawalsEnabled', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Bell className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold">Notification Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email alerts for deposits and withdrawals</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Telegram Notifications</p>
                <p className="text-sm text-muted-foreground">Send Telegram alerts for admin actions</p>
              </div>
              <Switch
                checked={settings.telegramNotifications}
                onCheckedChange={(checked) => updateSetting('telegramNotifications', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Contact Settings */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-border card-glow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Globe className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Telegram Support</label>
              <Input
                value={settings.telegramSupport}
                onChange={(e) => updateSetting('telegramSupport', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <Input
                value={settings.companyPhone}
                onChange={(e) => updateSetting('companyPhone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2" variant="gold" disabled={saving || loading}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

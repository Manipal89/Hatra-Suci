import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlockchainBackground from '@/components/BlockchainBackground';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { authAPI } from '@/services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      toast({
        title: 'Login Successful!',
        description: `Welcome back, ${response.data.username}!`,
      });

      // Always redirect to dashboard for regular users
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if it's a deposit verification error
      if (error.response?.data?.depositPending) {
        toast({
          title: 'Account Verification Pending',
          description: error.response.data.message || 'Your registration deposit is still being verified. Please try again after sometime.',
          variant: 'destructive',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Login Failed',
          description: error.response?.data?.message || 'Invalid email or password. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BlockchainBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="border-2 border-border rounded-xl bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-sm p-8 card-glow animate-glow-pulse">
          <h1 className="text-3xl font-serif text-center mb-8 text-gradient-gold tracking-wider">
            Hatra Suci
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-accent/50 focus:border-accent"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-accent/50 focus:border-accent"
                disabled={loading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            <p>Don't have an account?</p>
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:text-primary/80 underline font-semibold"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

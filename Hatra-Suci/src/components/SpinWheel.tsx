import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { userAPI, authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface SpinWheelProps {
  onClose: () => void;
  onRewardClaimed?: () => void;
}

const SpinWheel = ({ onClose, onRewardClaimed }: SpinWheelProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [hasScratched, setHasScratched] = useState(false);
  const [reward, setReward] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Check if user already spun today (based on calendar day, not 24h)
    const checkSpinStatus = async () => {
      try {
        const response = await authAPI.getProfile();
        const lastSpinTime = response.data.spinWheelLastUsed;
        
        if (lastSpinTime) {
          const now = new Date();
          const lastSpin = new Date(lastSpinTime);
          
          // Calculate start of today (midnight)
          const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);
          
          // Calculate start of tomorrow (next midnight)
          const startOfTomorrow = new Date(startOfToday);
          startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
          
          // Check if last spin was today (same calendar day)
          if (lastSpin >= startOfToday) {
            setAlreadySpun(true);
            setNextSpinTime(startOfTomorrow);
          }
        }
      } catch (error) {
        console.error('Failed to check spin status:', error);
      }
    };
    
    checkSpinStatus();

    // Initialize scratch card
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 200;

    // Draw scratch area
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '16px Arial';
    ctx.fillText('to reveal your prize!', canvas.width / 2, canvas.height / 2 + 20);

    // Don't set reward here - will get it from server after claim
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextSpinTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = nextSpinTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setAlreadySpun(false);
        setTimeRemaining('');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextSpinTime]);

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (hasScratched || alreadySpun) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) transparent++;
    }

    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    if (percentage > 60 && !hasScratched) {
      setHasScratched(true);
      setShowConfetti(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#F59E0B', '#22C55E', '#3B82F6', '#EF4444', '#A855F7'][Math.floor(Math.random() * 5)],
                width: '10px',
                height: '10px',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative bg-card border-2 border-border rounded-2xl p-6 max-w-md w-full card-glow">
        <h2 className="text-2xl font-bold text-center mb-4 text-gradient-gold">SCRATCH CARD</h2>
        
        <p className="text-center text-muted-foreground mb-4">
          Scratch the card to reveal your prize!
        </p>

        {/* Scratch Card Container */}
        <div className="relative w-full mb-4 rounded-xl overflow-hidden border-4 border-primary/50">
          {/* Prize behind scratch layer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8">
            <div className="text-center">
              <p className="text-6xl font-bold text-white mb-2">🎉</p>
              <p className="text-white text-lg font-semibold mb-2">Congratulations!</p>
              {reward > 0 ? (
                <p className="text-white text-4xl font-bold mb-2">{reward.toFixed(4)}</p>
              ) : (
                <p className="text-white text-3xl font-bold mb-2">???</p>
              )}
              <p className="text-white text-xl font-semibold">Tokens</p>
            </div>
          </div>

          {/* Scratch Layer (Canvas) */}
          <canvas
            ref={canvasRef}
            className="relative block cursor-crosshair touch-none"
            style={{ 
              width: '100%', 
              height: '200px',
              cursor: hasScratched || alreadySpun ? 'default' : 'crosshair',
              opacity: alreadySpun ? 0.5 : 1
            }}
            onMouseDown={() => !alreadySpun && setIsScratching(true)}
            onMouseUp={() => setIsScratching(false)}
            onMouseMove={(e) => isScratching && !alreadySpun && scratch(e)}
            onMouseLeave={() => setIsScratching(false)}
            onTouchStart={() => !alreadySpun && setIsScratching(true)}
            onTouchEnd={() => setIsScratching(false)}
            onTouchMove={(e) => isScratching && !alreadySpun && scratch(e)}
          />
        </div>

        {/* Progress Indicator */}
        {!hasScratched && scratchPercentage > 0 && (
          <div className="mb-4">
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                style={{ width: `${scratchPercentage}%` }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              {Math.round(scratchPercentage)}% scratched
            </p>
          </div>
        )}

        {/* Already Spun Warning */}
        {alreadySpun && (
          <div className="text-center mb-4 p-4 bg-warning/20 border border-warning/50 rounded-lg">
            <p className="text-lg font-bold text-warning">Already Claimed Today!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Next card available in: {timeRemaining}
            </p>
          </div>
        )}

        {/* Result Message */}
        {hasScratched && !alreadySpun && reward > 0 && (
          <div className="text-center mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-xl font-bold text-gradient-gold">You won {reward.toFixed(4)} Tokens!</p>
            <p className="text-sm text-muted-foreground mt-1">Next card available at midnight</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          {alreadySpun ? (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          ) : hasScratched ? (
            <>
              <Button 
                variant="gold" 
                onClick={async () => {
                  try {
                    setIsClaiming(true);
                    // Server generates and returns the actual reward
                    const response = await userAPI.spinWheel();
                    const actualReward = response.data.reward;
                    
                    // Update displayed reward with server response
                    setReward(actualReward);
                    
                    // Set next spin time to midnight
                    const now = new Date();
                    const startOfTomorrow = new Date(now);
                    startOfTomorrow.setHours(0, 0, 0, 0);
                    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
                    setAlreadySpun(true);
                    setNextSpinTime(startOfTomorrow);
                    
                    toast({
                      title: 'Reward Claimed!',
                      description: `$${actualReward.toFixed(4)} has been added to your balance.`,
                    });
                    
                    if (onRewardClaimed) {
                      onRewardClaimed();
                    }
                    
                    onClose();
                  } catch (error: any) {
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: error.response?.data?.message || 'Failed to claim reward',
                    });
                  } finally {
                    setIsClaiming(false);
                  }
                }}
                disabled={isClaiming}
              >
                {isClaiming ? 'Claiming...' : 'Claim Reward'}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Close
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      setHasScratched(true);
                      setShowConfetti(true);
                      setScratchPercentage(100);
                    }
                  }
                }}
              >
                Reveal All
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;

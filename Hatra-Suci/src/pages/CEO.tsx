import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Briefcase, Globe2, TrendingUp, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlockchainBackground from '@/components/BlockchainBackground';

const CEO = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <BlockchainBackground />
      
      <div className="relative z-10 p-4 max-w-6xl mx-auto pb-20">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 pt-4">
          <button 
            onClick={() => navigate('/about')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold flex-1">CEO Profile</h1>
        </header>

        {/* Headquarters Image */}
        <div className="mb-8 rounded-2xl overflow-hidden border-2 border-primary">
          <img 
            src="/headquarters.png" 
            alt="Hatra Suci Headquarters - Jl. Jenderal Sudirman, Jakarta" 
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>

        {/* CEO Profile Hero */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary rounded-2xl p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary">
              <img 
                src="/ceo.png" 
                alt="Mr. Robert Budi Hartono - CEO of Hatra Suci" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-gradient-gold mb-2">
                Mr. Robert Budi Hartono
              </h2>
              <p className="text-xl text-primary font-semibold mb-4">
                Founder & Chief Executive Officer
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Age: 62
                </span>
                <span className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5" />
                  Nationality: Indonesian
                </span>
                <span className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  20+ Years Experience
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About the CEO */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 mb-8 card-glow">
          <h2 className="text-3xl font-bold text-gradient-gold mb-6">🎯 Leadership & Vision</h2>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            <strong>Mr. Robert Budi Hartono</strong> is a visionary entrepreneur and one of Indonesia's most respected business leaders. With over <strong>20 years of experience</strong> in natural resources, global trade, and technology, he has successfully built Hatra Suci into a diversified, internationally recognized conglomerate.
          </p>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Under his leadership, Hatra Suci has expanded from a single commodity-focused business into a <strong>multi-sector enterprise</strong> operating in <strong>15+ countries</strong>, employing thousands, and serving over <strong>50,000 users</strong> through its blockchain platform.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            His commitment to <strong>ethical business</strong>, <strong>sustainability</strong>, and <strong>technological innovation</strong> has positioned Hatra Suci as a trusted partner in both traditional and digital economies.
          </p>
        </div>

        {/* Business Portfolio */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 mb-8 card-glow">
          <h2 className="text-3xl font-bold text-gradient-gold mb-6">💼 Business Portfolio</h2>
          
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-5 border border-border">
              <div className="flex items-start gap-4">
                <Building2 className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Natural Resources & Agriculture</h3>
                  <p className="text-muted-foreground">
                    Led the development of <strong>sustainable palm oil plantations</strong> and <strong>diamond mining operations</strong>, ensuring eco-friendly practices and ethical sourcing standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-5 border border-border">
              <div className="flex items-start gap-4">
                <Globe2 className="w-8 h-8 text-blue-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">International Trade & Export</h3>
                  <p className="text-muted-foreground">
                    Established <strong>global trade partnerships</strong> across Asia, the Middle East, and Africa, facilitating seamless <strong>import/export</strong> of commodities, raw materials, and finished goods.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-5 border border-border">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-8 h-8 text-yellow-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Blockchain & Fintech Innovation</h3>
                  <p className="text-muted-foreground">
                    Founded the <strong>Hatra Suci Investment Platform</strong>, a blockchain-powered USDT rewards system that combines traditional business revenue with cutting-edge digital finance.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-5 border border-border">
              <div className="flex items-start gap-4">
                <Users className="w-8 h-8 text-accent mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Community & Economic Development</h3>
                  <p className="text-muted-foreground">
                    Dedicated to <strong>empowering local communities</strong> through job creation, fair wages, and educational programs, strengthening Indonesia's economic foundation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Achievements */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 mb-8 card-glow">
          <h2 className="text-3xl font-bold text-gradient-gold mb-6">🏆 Key Achievements</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
              <div className="text-3xl font-bold text-primary mb-2">20+</div>
              <p className="font-semibold mb-1">Years of Leadership</p>
              <p className="text-sm text-muted-foreground">Decades of excellence in business</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
              <div className="text-3xl font-bold text-blue-500 mb-2">15+</div>
              <p className="font-semibold mb-1">Countries Reached</p>
              <p className="text-sm text-muted-foreground">Global expansion and partnerships</p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
              <div className="text-3xl font-bold text-green-500 mb-2">50K+</div>
              <p className="font-semibold mb-1">Active Platform Users</p>
              <p className="text-sm text-muted-foreground">Growing digital community</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5">
              <div className="text-3xl font-bold text-yellow-500 mb-2">$10M+</div>
              <p className="font-semibold mb-1">Rewards Distributed</p>
              <p className="text-sm text-muted-foreground">Value returned to users</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 mb-8 card-glow">
          <h2 className="text-3xl font-bold text-gradient-gold mb-6">💎 Leadership Philosophy</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="text-3xl">🌱</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Sustainability First</h3>
                <p className="text-muted-foreground text-sm">Every business decision considers long-term environmental and social impact.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-3xl">🤝</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Integrity & Transparency</h3>
                <p className="text-muted-foreground text-sm">Building trust through honest communication and ethical practices.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-3xl">🚀</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Innovation & Adaptation</h3>
                <p className="text-muted-foreground text-sm">Embracing technology while respecting traditional business values.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-3xl">👥</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">People-Centered Growth</h3>
                <p className="text-muted-foreground text-sm">Success is measured by the well-being of employees, partners, and communities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="gold" 
            size="lg"
            onClick={() => navigate('/register')}
          >
            Join Hatra Suci Today
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="ml-4"
            onClick={() => navigate('/contact')}
          >
            Get in Touch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CEO;

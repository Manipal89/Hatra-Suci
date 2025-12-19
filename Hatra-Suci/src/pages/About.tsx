import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Gem, Leaf, Globe, TrendingUp, Shield, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlockchainBackground from '@/components/BlockchainBackground';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <BlockchainBackground />
      
      <div className="relative z-10 p-4 max-w-6xl mx-auto pb-20">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 pt-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold flex-1">About Hatra Suci</h1>
        </header>

        {/* Headquarters Image */}
        <div className="mb-8 rounded-2xl overflow-hidden border-2 border-primary">
          <img 
            src="/headquarters.png" 
            alt="Hatra Suci Headquarters - Jl. Jenderal Sudirman, Jakarta" 
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary rounded-2xl p-8 md:p-12 mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
            Hatra Suci
          </h2>
          <p className="text-xl md:text-2xl text-primary font-semibold mb-4">
            Indonesia's Trusted Global Enterprise
          </p>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            A diversified Indonesia-based conglomerate and digital technology provider, operating across multiple high-value sectors including natural resources, global trade, and blockchain-powered financial technology.
          </p>
        </div>

        {/* About Company */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 mb-8 card-glow">
          <h2 className="text-3xl font-bold text-gradient-gold mb-6">🌏 About the Company</h2>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Founded and headquartered in <strong>Jakarta, Indonesia</strong>, Hatra Suci has been committed to sustainable business practices, efficient global operations, and technology-driven innovation for over two decades. We support long-term economic growth and community empowerment through our diverse operations.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Traditional Business Divisions
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Leaf className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Palm Oil Production & Refining</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gem className="w-5 h-5 text-purple-500 mt-0.5" />
                  <span>Diamond Mining & Mineral Exploration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                  <span>Export & Import Trading</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-accent mt-0.5" />
                  <span>Agricultural & Natural Resource Distribution</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Technology & Digital Business
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <span>Hatra Suci Investment & Rewards Platform - A blockchain-based USDT investment and daily reward system</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <span>Blockchain & Fintech Services using Binance Smart Chain (BSC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
                  <span>Secure Admin & Financial Monitoring Tools</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Global Expansion:</strong> Hatra Suci is expanding into new markets across Asia, the Middle East, and Africa, with a strategic focus on digital transformation and resource sustainability.
            </p>
          </div>
        </div>

        {/* Core Industries */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 mb-8 card-glow">
          <h2 className="text-3xl font-bold text-gradient-gold mb-6">🏭 Core Industries & Operations</h2>

          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Leaf className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-semibold">Palm Oil Division</h3>
              </div>
              <ul className="space-y-1 text-muted-foreground ml-11">
                <li>• Sustainable plantation management</li>
                <li>• Certified eco-friendly production</li>
                <li>• High-quality export-grade palm oil</li>
              </ul>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Gem className="w-8 h-8 text-purple-500" />
                <h3 className="text-xl font-semibold">Diamond Mining Division</h3>
              </div>
              <ul className="space-y-1 text-muted-foreground ml-11">
                <li>• Ethical mining operations</li>
                <li>• Advanced mineral extraction</li>
                <li>• Strict environmental compliance</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-8 h-8 text-blue-500" />
                <h3 className="text-xl font-semibold">Export & Import Division</h3>
              </div>
              <ul className="space-y-1 text-muted-foreground ml-11">
                <li>• International commodity trade</li>
                <li>• Agricultural products, minerals, and raw materials</li>
                <li>• Full logistics, customs, and distribution handling</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-yellow-500" />
                <h3 className="text-xl font-semibold">Blockchain Fintech Division</h3>
              </div>
              <ul className="space-y-1 text-muted-foreground ml-11">
                <li>• Home of the Hatra Suci Platform</li>
                <li>• Secure USDT transaction management</li>
                <li>• User reward and referral system</li>
                <li>• Admin-operated verification structure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 mb-8 card-glow">
          <h2 className="text-3xl font-bold text-gradient-gold mb-6">🛡 Our Commitment to Responsibility</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <p className="font-semibold mb-1">Ethical Resource Extraction</p>
              <p className="text-sm text-muted-foreground">Responsible sourcing with minimal environmental impact</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <Leaf className="w-8 h-8 text-green-500 mb-2" />
              <p className="font-semibold mb-1">Sustainable Production</p>
              <p className="text-sm text-muted-foreground">Eco-friendly practices in all operations</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <Award className="w-8 h-8 text-accent mb-2" />
              <p className="font-semibold mb-1">Fair Trade Practices</p>
              <p className="text-sm text-muted-foreground">Ethical business with transparent pricing</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="font-semibold mb-1">Community Support</p>
              <p className="text-sm text-muted-foreground">Empowering local communities and economies</p>
            </div>
          </div>

          <p className="mt-6 text-muted-foreground italic text-center">
            These values extend from our traditional businesses to our cutting-edge digital platforms.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="gold" 
            size="lg"
            onClick={() => navigate('/ceo')}
          >
            Meet Our CEO
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="ml-4"
            onClick={() => navigate('/contact')}
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import BlockchainBackground from '@/components/BlockchainBackground';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Our team will contact you within 24-48 hours.",
    });
  };

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
          <h1 className="text-2xl font-semibold flex-1">Contact Us</h1>
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
            Get In Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our team for support, inquiries, or partnership opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 card-glow">
              <h3 className="text-2xl font-bold text-gradient-gold mb-6">📞 Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Head Office</p>
                    <p className="text-sm text-muted-foreground">
                      Jl. Thamrin No. 59<br />
                      Jakarta Pusat 10350<br />
                      Jakarta, Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Phone Support</p>
                    <p className="text-sm text-muted-foreground">
                      +62 21 3192 xxxx<br />
                      Mon-Fri: 9:00 AM - 6:00 PM (WIB)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Email Support</p>
                    <p className="text-sm text-muted-foreground">
                      support@hatrasuci.co.id<br />
                      info@hatrasuci.co.id
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-lg border border-primary">
                  <MessageSquare className="w-6 h-6 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold mb-2">Telegram Support</p>
                    <a 
                      href="https://t.me/HatraSuciSupport"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <span>@HatraSuciSupport</span>
                      <Send className="w-4 h-4" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      For instant support and queries
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 card-glow">
              <h3 className="text-2xl font-bold text-gradient-gold mb-4">⏰ Business Hours</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-semibold">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-semibold">Closed</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                All times are in Western Indonesia Time (WIB)
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 card-glow">
            <h3 className="text-2xl font-bold text-gradient-gold mb-6">📧 Send Us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input 
                  type="text" 
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input 
                  type="tel" 
                  placeholder="+62 XXX XXXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input 
                  type="text" 
                  placeholder="What is this regarding?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea 
                  placeholder="Tell us how we can help you..."
                  className="min-h-[120px] resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="gold" 
                size="lg"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We typically respond within 24-48 hours
              </p>
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card/90 backdrop-blur-sm border-2 border-border rounded-xl p-6 md:p-8 card-glow">
          <h3 className="text-2xl font-bold text-gradient-gold mb-6 text-center">🔗 Quick Links</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/about')}
              className="p-4 bg-secondary/50 hover:bg-secondary rounded-lg border border-border transition-colors text-center"
            >
              <p className="font-semibold mb-1">About Us</p>
              <p className="text-xs text-muted-foreground">Learn about Hatra Suci</p>
            </button>

            <button 
              onClick={() => navigate('/ceo')}
              className="p-4 bg-secondary/50 hover:bg-secondary rounded-lg border border-border transition-colors text-center"
            >
              <p className="font-semibold mb-1">Meet Our CEO</p>
              <p className="text-xs text-muted-foreground">Leadership & vision</p>
            </button>

            <button 
              onClick={() => navigate('/register')}
              className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary transition-colors text-center"
            >
              <p className="font-semibold mb-1">Register Now</p>
              <p className="text-xs text-muted-foreground">Start earning rewards</p>
            </button>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            For urgent platform issues, please contact us via <a href="https://t.me/HatraSuciSupport" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Telegram</a> for fastest response.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;

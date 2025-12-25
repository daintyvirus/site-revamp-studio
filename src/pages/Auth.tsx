import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[150px]" />
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl font-bold">
              GOLDEN<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">BUMPS</span>
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">
            Your Gateway to
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Digital Gaming
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Instant delivery of game codes, gift cards, and digital products. Join thousands of satisfied gamers.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
            <div>
              <p className="text-2xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">
                GOLDEN<span className="text-primary">BUMPS</span>
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Sign in to continue shopping' : 'Join the gaming community'}
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-primary"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="font-semibold text-primary">{isLogin ? 'Sign up' : 'Sign in'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

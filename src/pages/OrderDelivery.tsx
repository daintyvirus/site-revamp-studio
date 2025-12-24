import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, Check, Eye, EyeOff, ExternalLink, Package, Shield, AlertCircle, HelpCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const platformRedeemUrls: Record<string, { name: string; url: string; steps: string[] }> = {
  steam: {
    name: 'Steam',
    url: 'https://store.steampowered.com/account/registerkey',
    steps: [
      'Open the Steam client or visit steam website',
      'Click "Games" → "Activate a Product on Steam"',
      'Follow the prompts and enter your code',
      'The game will be added to your library'
    ]
  },
  playstation: {
    name: 'PlayStation Store',
    url: 'https://store.playstation.com/redeem',
    steps: [
      'Sign in to PlayStation Store',
      'Click your avatar → "Redeem Codes"',
      'Enter the 12-digit code',
      'Click "Redeem" to add to your account'
    ]
  },
  xbox: {
    name: 'Microsoft/Xbox',
    url: 'https://redeem.microsoft.com',
    steps: [
      'Go to redeem.microsoft.com',
      'Sign in with your Microsoft account',
      'Enter the 25-character code',
      'Click "Next" to confirm redemption'
    ]
  },
  nintendo: {
    name: 'Nintendo eShop',
    url: 'https://ec.nintendo.com/redeem',
    steps: [
      'Open Nintendo eShop on your device',
      'Select "Enter Code" from the menu',
      'Enter the 16-digit code',
      'Confirm to add funds or content'
    ]
  },
  itunes: {
    name: 'Apple/iTunes',
    url: 'https://support.apple.com/en-us/HT201209',
    steps: [
      'Open the App Store on your device',
      'Tap your profile picture → "Redeem Gift Card"',
      'Enter the code manually or use camera',
      'Credit will be added to your Apple ID'
    ]
  },
  netflix: {
    name: 'Netflix',
    url: 'https://www.netflix.com/redeem',
    steps: [
      'Go to netflix.com/redeem',
      'Sign in to your account',
      'Enter your gift card code',
      'Credit will be applied to your account'
    ]
  },
  roblox: {
    name: 'Roblox',
    url: 'https://www.roblox.com/redeem',
    steps: [
      'Go to roblox.com/redeem',
      'Log in to your Roblox account',
      'Enter the PIN code from your card',
      'Robux/Premium will be added'
    ]
  },
  google: {
    name: 'Google Play',
    url: 'https://play.google.com/redeem',
    steps: [
      'Open Google Play Store app',
      'Tap Menu → "Redeem"',
      'Enter your code',
      'Credit will be added to your balance'
    ]
  },
  razer_gold: {
    name: 'Razer Gold',
    url: 'https://gold.razer.com/gold/index/reloadPin',
    steps: [
      'Go to gold.razer.com',
      'Sign in to your Razer account',
      'Click "Reload" → "Razer Gold PIN"',
      'Enter the PIN to add credits'
    ]
  },
  discord: {
    name: 'Discord',
    url: 'https://discord.com/app',
    steps: [
      'Open Discord app or website',
      'Go to User Settings → Gift Inventory',
      'Click "Redeem Codes"',
      'Enter your code to activate Nitro'
    ]
  },
  chatgpt: {
    name: 'ChatGPT/OpenAI',
    url: 'https://chat.openai.com',
    steps: [
      'Go to chat.openai.com',
      'Sign in to your account',
      'Go to Settings → Subscription',
      'Apply your code or upgrade'
    ]
  },
  other: {
    name: 'General',
    url: '',
    steps: [
      'Follow the instructions provided',
      'Contact support if you need help'
    ]
  }
};

export default function OrderDelivery() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(orderId || '');
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const logDeliveryView = async () => {
    if (!orderId || !user) return;
    try {
      await supabase.from('delivery_logs').insert({
        order_id: orderId,
        action: 'viewed',
        performed_by: user.id,
      });
    } catch (error) {
      console.error('Failed to log view:', error);
    }
  };

  const handleReveal = () => {
    setRevealed(true);
    logDeliveryView();
  };

  const handleCopy = async () => {
    if (!order?.delivery_info) return;
    try {
      await navigator.clipboard.writeText(order.delivery_info);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your delivery</p>
          <Button asChild className="glow-purple">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-48 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">This order doesn't exist or you don't have access</p>
          <Button asChild variant="outline">
            <Link to="/orders">View My Orders</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (!order.delivery_info) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Delivery Pending</h1>
          <p className="text-muted-foreground mb-6">
            Your order is being processed. You'll receive an email when your delivery is ready.
          </p>
          <Button asChild variant="outline">
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const platform = platformRedeemUrls[order.delivery_platform || 'other'] || platformRedeemUrls.other;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
            Delivered
          </Badge>
          <h1 className="font-display text-3xl font-bold mb-2">Your Digital Delivery</h1>
          <p className="text-muted-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product?.image_url && (
                    <img 
                      src={item.product.image_url} 
                      alt={item.product?.name} 
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Secure Code Display */}
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {order.delivery_type === 'account' ? 'Account Details' : 'Your Code'}
            </CardTitle>
            <CardDescription>
              Click to reveal your secure delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!revealed ? (
              <Button 
                onClick={handleReveal}
                className="w-full py-8 text-lg"
                variant="outline"
              >
                <Eye className="h-5 w-5 mr-2" />
                Click to Reveal
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="bg-muted p-4 rounded-lg font-mono text-lg break-all select-all border-2 border-primary/30">
                    {order.delivery_info}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="absolute top-2 right-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button 
                  onClick={() => setRevealed(false)} 
                  variant="ghost" 
                  size="sm"
                  className="w-full"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Instructions */}
        {order.delivery_instructions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Delivery Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {order.delivery_instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Platform Redemption Instructions */}
        {platform && platform.name !== 'General' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">How to Redeem on {platform.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                {platform.steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {platform.url && (
                <Button asChild variant="outline" className="w-full">
                  <a href={platform.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to {platform.name} Redeem Page
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="not-working">
                <AccordionTrigger>Code not working?</AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Make sure you're entering the code exactly as shown</li>
                    <li>• Check that you're on the correct platform</li>
                    <li>• Ensure your account region matches the code region</li>
                    <li>• Contact our support if the issue persists</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="contact">
                <AccordionTrigger>Contact Support</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is available 10AM - 2AM Everyday
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href="mailto:support@goldenbumps.com">
                      Email Support
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Digital products are non-refundable once the code has been revealed.</p>
          <p>Support hours: 10AM - 2AM Everyday</p>
        </div>
      </div>
    </Layout>
  );
}
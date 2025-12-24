import { useState } from 'react';
import { Save, Mail, Eye, Palette, FileText, Loader2, Send, History, Code, Building2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEmailTemplates, useUpdateEmailTemplate, useEmailLogs, statusTypeLabels, availableShortcodes, EmailTemplate } from '@/hooks/useEmailTemplates';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const statusToFunctionMap: Record<string, string> = {
  order_confirmation: 'send-order-confirmation',
  payment_paid: 'send-payment-notification',
  payment_failed: 'send-payment-notification',
  shipping: 'send-shipping-notification',
  delivery: 'send-delivery-notification',
  cancelled: 'send-cancellation-notification',
  refunded: 'send-refund-notification',
};

export default function AdminEmailTemplates() {
  const { data: templates, isLoading } = useEmailTemplates();
  const { data: emailLogs, isLoading: logsLoading } = useEmailLogs();
  const updateTemplate = useUpdateEmailTemplate();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});
  const [showLogs, setShowLogs] = useState(false);
  
  const [testEmailTemplate, setTestEmailTemplate] = useState<EmailTemplate | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      sender_email: template.sender_email,
      sender_name: template.sender_name,
      subject_template: template.subject_template,
      header_title: template.header_title,
      header_color: template.header_color,
      body_intro: template.body_intro,
      body_content: template.body_content || '',
      show_order_details: template.show_order_details,
      show_tracking_button: template.show_tracking_button,
      tracking_button_text: template.tracking_button_text || '',
      footer_text: template.footer_text || '',
      is_active: template.is_active,
      support_email: template.support_email || '',
      company_name: template.company_name || '',
      company_logo_url: template.company_logo_url || '',
      help_center_url: template.help_center_url || '',
    });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, ...formData });
      toast.success('Email template updated successfully');
      setEditingTemplate(null);
    } catch {
      toast.error('Failed to update email template');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTemplate || !testEmailAddress) {
      toast.error('Please enter an email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailAddress)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSendingTestEmail(true);
    try {
      const functionName = statusToFunctionMap[testEmailTemplate.status_type];
      let body: Record<string, any> = {
        customerEmail: testEmailAddress,
        customerName: 'Test Customer',
        orderId: 'test12345678',
        orderTotal: 1500,
      };
      if (testEmailTemplate.status_type === 'payment_paid') body.paymentStatus = 'paid';
      else if (testEmailTemplate.status_type === 'payment_failed') body.paymentStatus = 'failed';
      else if (testEmailTemplate.status_type === 'order_confirmation') {
        body.paymentMethod = 'GCash';
        body.transactionId = 'TEST-TXN-123456';
        body.items = [{ name: 'Test Product 1', quantity: 2, price: 500 }, { name: 'Test Product 2', quantity: 1, price: 500 }];
      } else if (testEmailTemplate.status_type === 'refunded') body.refundAmount = 1500;

      const { data, error } = await supabase.functions.invoke(functionName, { body });
      if (error) toast.error('Failed to send test email');
      else if (data?.success) {
        toast.success(`Test email sent to ${testEmailAddress}`);
        setTestEmailTemplate(null);
        setTestEmailAddress('');
      } else toast.error(data?.message || 'Failed to send test email');
    } catch {
      toast.error('Failed to send test email');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const getStatusColor = (statusType: string) => {
    const colors: Record<string, string> = {
      order_confirmation: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
      payment_paid: 'bg-green-500/20 text-green-600 border-green-500/30',
      payment_failed: 'bg-red-500/20 text-red-600 border-red-500/30',
      shipping: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      delivery: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-600 border-red-500/30',
      refunded: 'bg-violet-500/20 text-violet-600 border-violet-500/30',
    };
    return colors[statusType] || 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  };

  const insertShortcode = (code: string, field: 'body_intro' | 'body_content' | 'footer_text' | 'subject_template' | 'header_title') => {
    setFormData({ ...formData, [field]: (formData[field] || '') + code });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              Email Templates
            </h1>
            <p className="text-muted-foreground">Customize email notifications with shortcodes</p>
          </div>
          <Button variant="outline" onClick={() => setShowLogs(true)}>
            <History className="h-4 w-4 mr-2" />
            View Logs
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates?.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(template.status_type)}>
                      {statusTypeLabels[template.status_type] || template.status_type}
                    </Badge>
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={async (checked) => {
                        try {
                          await updateTemplate.mutateAsync({ id: template.id, is_active: checked });
                          toast.success(checked ? 'Template enabled' : 'Template disabled');
                        } catch {
                          toast.error('Failed to update template status');
                        }
                      }}
                    />
                  </div>
                  <CardTitle className="text-lg mt-2">{template.header_title}</CardTitle>
                  <CardDescription className="text-xs">From: {template.sender_name} &lt;{template.sender_email}&gt;</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{template.body_intro}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(template)} className="flex-1">
                      <FileText className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setTestEmailTemplate(template)} title="Send Test Email"><Send className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><Mail className="h-5 w-5" /> Edit Email Template</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="sender" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="sender">Sender</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="shortcodes">Shortcodes</TabsTrigger>
            </TabsList>

            <TabsContent value="sender" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sender Email</Label>
                  <Input value={formData.sender_email || ''} onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })} placeholder="support@goldenbumps.com" />
                </div>
                <div className="space-y-2">
                  <Label>Sender Name</Label>
                  <Input value={formData.sender_name || ''} onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })} placeholder="Golden Bumps" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Support Email (for footer)</Label>
                  <Input value={formData.support_email || ''} onChange={(e) => setFormData({ ...formData, support_email: e.target.value })} placeholder="support@goldenbumps.com" />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={formData.company_name || ''} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} placeholder="Golden Bumps" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input value={formData.subject_template || ''} onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })} placeholder="Order Confirmed - #{order_id}" />
                <p className="text-xs text-muted-foreground">Use shortcodes like {'{order_id}'}, {'{customer_name}'}</p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Header Title</Label>
                <Input value={formData.header_title || ''} onChange={(e) => setFormData({ ...formData, header_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Introduction Text</Label>
                <Textarea value={formData.body_intro || ''} onChange={(e) => setFormData({ ...formData, body_intro: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Additional Content</Label>
                <Textarea value={formData.body_content || ''} onChange={(e) => setFormData({ ...formData, body_content: e.target.value })} rows={3} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><Label>Show Order Details</Label></div>
                <Switch checked={formData.show_order_details ?? true} onCheckedChange={(checked) => setFormData({ ...formData, show_order_details: checked })} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><Label>Show Tracking Button</Label></div>
                <Switch checked={formData.show_tracking_button ?? true} onCheckedChange={(checked) => setFormData({ ...formData, show_tracking_button: checked })} />
              </div>
              {formData.show_tracking_button && (
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={formData.tracking_button_text || ''} onChange={(e) => setFormData({ ...formData, tracking_button_text: e.target.value })} placeholder="Track Your Order" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="footer" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Footer Text (Full Customization)</Label>
                <Textarea value={formData.footer_text || ''} onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })} rows={6} placeholder="This is an automated message from {company_name}.&#10;&#10;Please do not reply directly to this email.&#10;&#10;For support, contact us at {support_email}" />
                <p className="text-xs text-muted-foreground">Use shortcodes like {'{company_name}'}, {'{support_email}'} for dynamic content</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => insertShortcode('{company_name}', 'footer_text')}><Building2 className="h-3 w-3 mr-1" /> Company Name</Button>
                <Button variant="outline" size="sm" onClick={() => insertShortcode('{support_email}', 'footer_text')}><Mail className="h-3 w-3 mr-1" /> Support Email</Button>
                <Button variant="outline" size="sm" onClick={() => insertShortcode('{shop_url}', 'footer_text')}><Code className="h-3 w-3 mr-1" /> Shop URL</Button>
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> Header Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={formData.header_color || '#8B5CF6'} onChange={(e) => setFormData({ ...formData, header_color: e.target.value })} className="w-16 h-10 p-1 cursor-pointer" />
                  <Input value={formData.header_color || '#8B5CF6'} onChange={(e) => setFormData({ ...formData, header_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Company Logo URL</Label>
                <Input value={formData.company_logo_url || ''} onChange={(e) => setFormData({ ...formData, company_logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
              </div>
            </TabsContent>

            <TabsContent value="shortcodes" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Code className="h-4 w-4" /> Available Shortcodes</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {availableShortcodes.map((sc) => (
                      <div key={sc.code} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div>
                          <code className="bg-muted px-1 rounded text-xs">{sc.code}</code>
                          <p className="text-xs text-muted-foreground mt-1">{sc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={updateTemplate.isPending} className="flex-1">
              {updateTemplate.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
          {previewTemplate && (
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 text-white text-center" style={{ background: `linear-gradient(135deg, ${previewTemplate.header_color}, ${previewTemplate.header_color}CC)` }}>
                <h2 className="text-xl font-bold">{previewTemplate.header_title}</h2>
              </div>
              <div className="p-4 bg-white">
                <p>Dear <strong>Customer Name</strong>,</p>
                <p className="mt-2">{previewTemplate.body_intro}</p>
                {previewTemplate.body_content && <p className="mt-2">{previewTemplate.body_content}</p>}
              </div>
              <div className="p-4 bg-muted text-center text-xs text-muted-foreground whitespace-pre-line">{previewTemplate.footer_text}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={!!testEmailTemplate} onOpenChange={() => setTestEmailTemplate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Test Email</DialogTitle><DialogDescription>Send a test email to verify the template.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={testEmailAddress} onChange={(e) => setTestEmailAddress(e.target.value)} placeholder="test@example.com" />
            </div>
            <Button onClick={handleSendTestEmail} disabled={sendingTestEmail} className="w-full">
              {sendingTestEmail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Send Test Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Logs Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Email Delivery Logs</DialogTitle></DialogHeader>
          <ScrollArea className="h-[500px]">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{new Date(log.sent_at).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline">{statusTypeLabels[log.template_type] || log.template_type}</Badge></TableCell>
                      <TableCell className="text-xs">{log.recipient_email}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{log.subject}</TableCell>
                      <TableCell>
                        <Badge className={log.status === 'sent' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}>{log.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!emailLogs || emailLogs.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No email logs yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

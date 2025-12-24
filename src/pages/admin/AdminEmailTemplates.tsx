import { useState } from 'react';
import { Save, Mail, Eye, Palette, Type, FileText, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEmailTemplates, useUpdateEmailTemplate, statusTypeLabels, EmailTemplate } from '@/hooks/useEmailTemplates';
import { toast } from 'sonner';

export default function AdminEmailTemplates() {
  const { data: templates, isLoading } = useEmailTemplates();
  const updateTemplate = useUpdateEmailTemplate();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});

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
    });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    try {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        ...formData,
      });
      toast.success('Email template updated successfully');
      setEditingTemplate(null);
    } catch (error) {
      toast.error('Failed to update email template');
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

  const renderPreviewEmail = (template: EmailTemplate) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; }
          .header { background: linear-gradient(135deg, ${template.header_color} 0%, ${template.header_color}CC 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .order-info { background: #F5F3FF; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #DDD6FE; }
          .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); color: #1a1a1a; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${template.header_title}</h1>
          </div>
          <div class="content">
            <p>Dear <strong>Customer Name</strong>,</p>
            <p>${template.body_intro}</p>
            ${template.body_content ? `<p>${template.body_content}</p>` : ''}
            ${template.show_order_details ? `
              <div class="order-info">
                <p><strong>Order ID:</strong> #ABC12345</p>
                <p><strong>Total:</strong> ₱1,500.00</p>
              </div>
            ` : ''}
            ${template.show_tracking_button ? `
              <div style="text-align: center; margin: 25px 0;">
                <a href="#" class="cta">${template.tracking_button_text || 'Track Your Order'}</a>
              </div>
            ` : ''}
            <p>Best regards,<br><strong>${template.sender_name}</strong></p>
          </div>
          <div class="footer">
            <p>${template.footer_text}</p>
            <p>Sent from: ${template.sender_email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            Email Templates
          </h1>
          <p className="text-muted-foreground">Customize email notifications for each order status</p>
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
                  <CardDescription className="text-xs">
                    From: {template.sender_name} &lt;{template.sender_email}&gt;
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {template.body_intro}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(template)} className="flex-1">
                      <FileText className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Edit Email Template
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="sender" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sender">Sender</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>

            <TabsContent value="sender" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  value={formData.sender_email || ''}
                  onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                  placeholder="support@goldenbumps.com"
                />
                <p className="text-xs text-muted-foreground">
                  This email must be verified with your email provider (Hostinger)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  value={formData.sender_name || ''}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                  placeholder="Golden Bumps"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject_template">Email Subject</Label>
                <Input
                  id="subject_template"
                  value={formData.subject_template || ''}
                  onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                  placeholder="Order Confirmed - #{ORDER_ID} | Golden Bumps"
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{ORDER_ID}'} to include the order ID
                </p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="header_title">Email Header Title</Label>
                <Input
                  id="header_title"
                  value={formData.header_title || ''}
                  onChange={(e) => setFormData({ ...formData, header_title: e.target.value })}
                  placeholder="🎉 Order Confirmed!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_intro">Introduction Text</Label>
                <Textarea
                  id="body_intro"
                  value={formData.body_intro || ''}
                  onChange={(e) => setFormData({ ...formData, body_intro: e.target.value })}
                  placeholder="Thank you for your order!"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_content">Additional Content</Label>
                <Textarea
                  id="body_content"
                  value={formData.body_content || ''}
                  onChange={(e) => setFormData({ ...formData, body_content: e.target.value })}
                  placeholder="Any additional message..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_text">Footer Text</Label>
                <Input
                  id="footer_text"
                  value={formData.footer_text || ''}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  placeholder="This is an automated message from Golden Bumps."
                />
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="header_color" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Header Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="header_color"
                    type="color"
                    value={formData.header_color || '#8B5CF6'}
                    onChange={(e) => setFormData({ ...formData, header_color: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.header_color || '#8B5CF6'}
                    onChange={(e) => setFormData({ ...formData, header_color: e.target.value })}
                    placeholder="#8B5CF6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: formData.header_color || '#8B5CF6' }}>
                <p className="text-white text-center font-bold">Header Preview</p>
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Show Order Details</Label>
                  <p className="text-xs text-muted-foreground">Display order ID and total in email</p>
                </div>
                <Switch
                  checked={formData.show_order_details ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_order_details: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Show Tracking Button</Label>
                  <p className="text-xs text-muted-foreground">Include call-to-action button</p>
                </div>
                <Switch
                  checked={formData.show_tracking_button ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_tracking_button: checked })}
                />
              </div>
              {formData.show_tracking_button && (
                <div className="space-y-2">
                  <Label htmlFor="tracking_button_text">Button Text</Label>
                  <Input
                    id="tracking_button_text"
                    value={formData.tracking_button_text || ''}
                    onChange={(e) => setFormData({ ...formData, tracking_button_text: e.target.value })}
                    placeholder="Track Your Order"
                  />
                </div>
              )}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Template Active</Label>
                  <p className="text-xs text-muted-foreground">Enable/disable this email notification</p>
                </div>
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateTemplate.isPending}>
              {updateTemplate.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Email Preview - {previewTemplate && statusTypeLabels[previewTemplate.status_type]}
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div 
              className="border rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: renderPreviewEmail(previewTemplate) }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

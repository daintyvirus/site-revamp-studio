import { jsPDF } from 'jspdf';
import type { Order } from '@/types/database';

function formatPrice(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${Number(amount).toFixed(2)}`;
  }
  return `BDT ${Math.round(Number(amount)).toLocaleString()}`;
}

export function generateInvoicePDF(order: Order, companyName: string = 'Golden Bumps'): void {
  const doc = new jsPDF();
  const orderCurrency = (order as any).currency || 'BDT';
  
  // Colors
  const primaryColor: [number, number, number] = [139, 92, 246]; // Purple
  const darkColor: [number, number, number] = [26, 26, 26];
  const grayColor: [number, number, number] = [107, 114, 128];
  
  let y = 20;
  
  // Header with company name
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 20, y);
  
  // Invoice label
  doc.setFontSize(12);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE', 160, y, { align: 'left' });
  
  y += 15;
  
  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`, 20, y);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 160, y, { align: 'left' });
  
  y += 20;
  
  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  
  y += 15;
  
  // Customer info section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Bill To:', 20, y);
  
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  
  if (order.customer_name) {
    doc.text(order.customer_name, 20, y);
    y += 6;
  }
  if (order.customer_email) {
    doc.text(order.customer_email, 20, y);
    y += 6;
  }
  if (order.customer_phone) {
    doc.text(order.customer_phone, 20, y);
    y += 6;
  }
  
  y += 10;
  
  // Order info on right side
  const rightX = 120;
  let rightY = y - 30;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Order Details:', rightX, rightY);
  
  rightY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.text(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`, rightX, rightY);
  rightY += 6;
  doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, rightX, rightY);
  rightY += 6;
  doc.text(`Payment: ${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}`, rightX, rightY);
  rightY += 6;
  if (order.payment_method) {
    doc.text(`Method: ${order.payment_method}`, rightX, rightY);
    rightY += 6;
  }
  if (order.transaction_id) {
    doc.text(`Transaction: ${order.transaction_id}`, rightX, rightY);
  }
  
  y += 15;
  
  // Items table header
  doc.setFillColor(249, 250, 251);
  doc.rect(20, y, 170, 10, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Item', 25, y + 7);
  doc.text('Qty', 120, y + 7);
  doc.text('Price', 145, y + 7);
  doc.text('Total', 175, y + 7, { align: 'right' });
  
  y += 15;
  
  // Items
  doc.setFont('helvetica', 'normal');
  
  order.items?.forEach((item) => {
    const itemName = item.product?.name || 'Unknown Product';
    const variantName = item.variant?.name ? ` (${item.variant.name})` : '';
    const displayName = itemName + variantName;
    
    // Truncate long names
    const maxWidth = 85;
    let truncatedName = displayName;
    while (doc.getTextWidth(truncatedName) > maxWidth && truncatedName.length > 0) {
      truncatedName = truncatedName.slice(0, -1);
    }
    if (truncatedName !== displayName) {
      truncatedName = truncatedName.slice(0, -3) + '...';
    }
    
    doc.text(truncatedName, 25, y);
    doc.text(item.quantity.toString(), 125, y);
    doc.text(formatPrice(item.price, orderCurrency), 145, y);
    doc.text(formatPrice(item.price * item.quantity, orderCurrency), 175, y, { align: 'right' });
    
    y += 8;
    
    // Add page break if needed
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });
  
  y += 5;
  
  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(20, y, 190, y);
  
  y += 10;
  
  // Total section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Total Amount:', 120, y);
  doc.text(formatPrice(order.total, orderCurrency), 175, y, { align: 'right' });
  
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Currency: ${orderCurrency}`, 120, y);
  
  // Footer
  const footerY = 280;
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Thank you for your purchase!', 105, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, footerY + 5, { align: 'center' });
  
  // Save the PDF
  doc.save(`Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
}

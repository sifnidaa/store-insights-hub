import jsPDF from "jspdf";
import type { Invoice } from "@/data/store-data";

type InvoicePdfSettings = {
  storeName: string;
  storePhone: string;
  storeAddress: string;
};

export const formatInvoiceDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const generateInvoicePDF = (inv: Invoice, settings: InvoicePdfSettings) => {
  const doc = new jsPDF({ putOnlyUsedFonts: true });

  // Use default font (Helvetica) - works without Arabic font
  doc.setFontSize(18);
  doc.text(settings.storeName, 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`${settings.storePhone} | ${settings.storeAddress}`, 105, 28, { align: "center" });

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(20, 33, 190, 33);

  doc.setFontSize(14);
  doc.text(`# ${inv.id}`, 190, 42, { align: "right" });
  doc.setFontSize(10);
  doc.text(formatInvoiceDate(inv.date), 20, 42);

  let y = 55;
  if (inv.customerName) {
    doc.text(`Client: ${inv.customerName}`, 190, y, { align: "right" });
    y += 7;
  }
  if (inv.customerPhone) {
    doc.text(`Phone: ${inv.customerPhone}`, 190, y, { align: "right" });
    y += 7;
  }

  y += 5;
  doc.setFillColor(59, 130, 246);
  doc.setTextColor(255, 255, 255);
  doc.rect(20, y, 170, 8, "F");
  doc.setFontSize(10);
  doc.text("Total", 30, y + 6);
  doc.text("Price", 65, y + 6);
  doc.text("Qty", 100, y + 6);
  doc.text("Product", 180, y + 6, { align: "right" });
  y += 8;

  doc.setTextColor(0, 0, 0);
  inv.items.forEach((item, i) => {
    const bg = i % 2 === 0 ? 245 : 255;
    doc.setFillColor(bg, bg, bg);
    doc.rect(20, y, 170, 8, "F");
    doc.text(`${(item.price * item.quantity).toLocaleString()} DZD`, 30, y + 6);
    doc.text(`${item.price.toLocaleString()} DZD`, 65, y + 6);
    doc.text(String(item.quantity), 100, y + 6);
    doc.text(item.productName, 180, y + 6, { align: "right" });
    y += 8;
  });

  y += 5;
  doc.setDrawColor(59, 130, 246);
  doc.line(20, y, 190, y);
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text(`Total: ${inv.total.toLocaleString()} DZD`, 105, y, { align: "center" });
  doc.setTextColor(0, 0, 0);

  y += 8;
  doc.setFontSize(10);
  doc.text(`Payment: ${inv.paymentMethod}`, 105, y, { align: "center" });

  return doc;
};

export const downloadInvoicePDF = (inv: Invoice, settings: InvoicePdfSettings) => {
  const doc = generateInvoicePDF(inv, settings);
  doc.save(`invoice-${inv.id}.pdf`);
};

export const printInvoicePDF = (inv: Invoice, settings: InvoicePdfSettings) => {
  const doc = generateInvoicePDF(inv, settings);
  doc.autoPrint();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

export const shareInvoiceWhatsApp = (inv: Invoice, settings: InvoicePdfSettings) => {
  let text = `فاتورة رقم: ${inv.id}\n`;
  text += `${settings.storeName}\n`;
  text += `التاريخ: ${formatInvoiceDate(inv.date)}\n`;
  if (inv.customerName) text += `العميل: ${inv.customerName}\n`;
  text += `\nالمنتجات:\n`;
  inv.items.forEach(i => {
    text += `- ${i.productName} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString()} د.ج\n`;
  });
  text += `\nالإجمالي: ${inv.total.toLocaleString()} د.ج\n`;
  text += `طريقة الدفع: ${inv.paymentMethod}`;

  const encoded = encodeURIComponent(text);
  const phone = inv.customerPhone ? inv.customerPhone.replace(/^0/, "213") : "";
  window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
};


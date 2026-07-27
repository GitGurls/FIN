import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportTransactionsToPDF = (transactions, currency = "INR") => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("FinPilot AI — Transactions", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Exported on ${new Date().toLocaleDateString()}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Type", "Category", "Amount", "Note"]],
    body: transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      `${t.type === "income" ? "+" : "-"}${currency} ${t.amount.toLocaleString()}`,
      t.note || "",
    ]),
    headStyles: { fillColor: [16, 21, 40] },
    styles: { fontSize: 9 },
  });

  doc.save(`finpilot-transactions-${Date.now()}.pdf`);
};

export const exportTransactionsToExcel = (transactions) => {
  const rows = transactions.map((t) => ({
    Date: new Date(t.date).toLocaleDateString(),
    Type: t.type,
    Category: t.category,
    Amount: t.amount,
    Note: t.note || "",
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  XLSX.writeFile(workbook, `finpilot-transactions-${Date.now()}.xlsx`);
};

import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { DiagnosticCode } from '../types/diagnosticCode';

interface ExportButtonProps {
  codes: DiagnosticCode[];
}

export function ExportButton({ codes }: ExportButtonProps) {
  const exportToJSON = () => {
    const dataStr = JSON.stringify(codes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic-codes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Code', 'Description', 'Category', 'Subcategory', 'Severity', 'Active'];
    const rows = codes.map(code => [
      code.code,
      code.description,
      code.category || '',
      code.subcategory || '',
      code.severity || '',
      code.is_active ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic-codes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToJSON}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export JSON
      </Button>
    </div>
  );
}

import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KeyboardShortcutsHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelper({ isOpen, onClose }: KeyboardShortcutsHelperProps) {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Focus search box', category: 'Navigation' },
    { keys: ['Ctrl', 'N'], description: 'Create new code', category: 'Actions' },
    { keys: ['Ctrl', 'E'], description: 'Export codes', category: 'Actions' },
    { keys: ['Ctrl', 'I'], description: 'Import codes', category: 'Actions' },
    { keys: ['Ctrl', 'A'], description: 'Select all codes', category: 'Selection' },
    { keys: ['Ctrl', 'Delete'], description: 'Delete selected', category: 'Actions' },
    { keys: ['Ctrl', '→'], description: 'Next page', category: 'Navigation' },
    { keys: ['Ctrl', '←'], description: 'Previous page', category: 'Navigation' },
    { keys: ['?'], description: 'Toggle this help', category: 'Help' },
    { keys: ['Esc'], description: 'Close modals', category: 'Navigation' },
  ];

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-primary">{category}</h3>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t text-center">
          Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd> or{' '}
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd> to close this panel
        </p>
      </DialogContent>
    </Dialog>
  );
}

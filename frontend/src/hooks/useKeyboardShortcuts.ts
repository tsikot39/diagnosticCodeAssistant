import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onSearch?: () => void;
  onEscape?: () => void;
  onNew?: () => void;
  onHelp?: () => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onSearch,
  onEscape,
  onNew,
  onHelp,
  onNextPage,
  onPrevPage,
  onExport,
  onImport,
  onDelete,
  onSelectAll,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // Ctrl+N or Cmd+N for new
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNew?.();
        return;
      }

      // Ctrl+E or Cmd+E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        onExport?.();
        return;
      }

      // Ctrl+I or Cmd+I for import
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        onImport?.();
        return;
      }

      // Ctrl+A or Cmd+A for select all (when not in input)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !isInput) {
        e.preventDefault();
        onSelectAll?.();
        return;
      }

      // ESC to close/cancel
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // ? for help
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        onHelp?.();
        return;
      }

      // Arrow keys for pagination (when not in input)
      if (!isInput) {
        if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          onNextPage?.();
        } else if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          onPrevPage?.();
        }
      }

      // Delete key for bulk delete
      if (e.key === 'Delete' && !isInput && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onDelete?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onEscape, onNew, onHelp, onNextPage, onPrevPage, onExport, onImport, onDelete, onSelectAll, enabled]);
}

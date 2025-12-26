import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { useInstallPrompt, useOnlineStatus } from '@/hooks/usePWA';
import { useState } from 'react';

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-primary text-primary-foreground rounded-lg shadow-lg p-4 z-50 animate-slide-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5" />
              <h3 className="font-semibold">Install App</h3>
            </div>
            <p className="text-sm opacity-90 mb-3">
              Install Diagnostic Code Assistant for offline access and a better experience!
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={promptInstall}
                className="flex-1"
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                Not now
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-sm font-medium z-40">
          You are offline. Some features may be limited.
        </div>
      )}
    </>
  );
}

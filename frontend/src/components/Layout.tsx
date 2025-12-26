import { ReactNode } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { PWAInstallPrompt } from './PWAInstallPrompt'
import { NotificationBell } from './NotificationBell'
import { OrganizationSwitcher } from './OrganizationSwitcher'
import { Sidebar } from './Sidebar'
import { Logo } from './Logo'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <PWAInstallPrompt />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <Logo size={32} className="flex-shrink-0" />
              <h1 className="text-xl font-bold text-primary hidden sm:block">
                Diagnostic Code Assistant
              </h1>
              <h1 className="text-xl font-bold text-primary sm:hidden">
                DCA
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OrganizationSwitcher 
              currentOrgId={(user as any)?.organization_id}
            />
            <NotificationBell />
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-primary font-semibold capitalize">{(user as any).role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="pt-16 pl-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t pl-64 bg-background">
        <div className="px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Diagnostic Code Assistant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

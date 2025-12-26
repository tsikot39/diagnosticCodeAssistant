import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Activity, 
  FileText, 
  Webhook, 
  Users, 
  Building2, 
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Analytics', href: '/analytics', icon: Activity },
    { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
    { name: 'Webhooks', href: '/webhooks', icon: Webhook },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40">
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

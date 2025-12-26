import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

interface Organization {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface OrganizationSwitcherProps {
  currentOrgId?: number;
  onSwitch?: (orgId: number) => void;
  className?: string;
}

export function OrganizationSwitcher({ 
  currentOrgId, 
  onSwitch,
  className 
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (currentOrgId && organizations.length > 0) {
      const org = organizations.find(o => o.id === currentOrgId);
      if (org) {
        setSelectedOrg(org);
      }
    }
  }, [currentOrgId, organizations]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/organizations');
      const orgs = response.data.organizations || [];
      setOrganizations(orgs.filter((org: Organization) => org.is_active));
      
      // Set first active org as default if none selected
      if (!selectedOrg && orgs.length > 0) {
        const activeOrg = orgs.find((org: Organization) => org.is_active);
        if (activeOrg) {
          setSelectedOrg(activeOrg);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (org: Organization) => {
    setSelectedOrg(org);
    setOpen(false);
    
    if (onSwitch) {
      onSwitch(org.id);
    } else {
      // Default behavior: reload page with new org context
      // In a real app, you might update a global state or context
      window.location.reload();
    }
    
    toast.success(`Switched to ${org.name}`);
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground", className)}>
        <Building2 className="h-4 w-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground", className)}>
        <Building2 className="h-4 w-4" />
        <span>No organizations</span>
      </div>
    );
  }

  // If only one organization, don't show switcher
  if (organizations.length === 1) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 text-sm", className)}>
        <Building2 className="h-4 w-4" />
        <span className="font-medium">{organizations[0].name}</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-[200px]", className)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {selectedOrg ? selectedOrg.name : 'Select organization...'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleSelect(org)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOrg?.id === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{org.name}</span>
                    <span className="text-xs text-muted-foreground">/{org.slug}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

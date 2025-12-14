import { Menu, UnstyledButton, Text, Group, Loader, Tooltip } from '@mantine/core';
import { useEffect } from 'react';
import { useMyTenants } from '../../hooks';
import { useTenant } from '../../lib/TenantContext';
import classes from './TenantSelector.module.css';

function HouseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface TenantSelectorProps {
  variant?: 'sidebar' | 'mobile';
}

export function TenantSelector({ variant = 'sidebar' }: TenantSelectorProps) {
  const { data: tenantsData, isLoading } = useMyTenants();
  const { currentTenantId, setCurrentTenant } = useTenant();

  const tenants = tenantsData?.tenants ?? [];
  const currentTenant = tenants.find((t) => t.id === currentTenantId);

  // Auto-select first tenant if none selected
  useEffect(() => {
    if (!isLoading && tenants.length > 0 && currentTenantId === null) {
      setCurrentTenant(tenants[0]);
    }
    // Also set tenant if we only have the ID stored but not the full object
    if (!isLoading && tenants.length > 0 && currentTenantId !== null && !currentTenant) {
      const tenant = tenants.find((t) => t.id === currentTenantId);
      if (tenant) {
        setCurrentTenant(tenant);
      } else {
        // Stored tenant no longer exists, select first available
        setCurrentTenant(tenants[0]);
      }
    }
  }, [isLoading, tenants, currentTenantId, currentTenant, setCurrentTenant]);

  if (isLoading) {
    if (variant === 'sidebar') {
      return (
        <div className={classes.sidebarButton}>
          <Loader size="xs" color="coral" />
        </div>
      );
    }
    return (
      <Group gap="sm" p="sm">
        <Loader size="xs" color="coral" />
        <Text size="sm" c="dimmed">Chargement...</Text>
      </Group>
    );
  }

  if (tenants.length === 0) {
    return null;
  }

  // Mobile variant - full width with text
  if (variant === 'mobile') {
    if (tenants.length === 1) {
      return (
        <Group gap="sm" p="sm">
          <HouseIcon size={20} />
          <Text size="sm" fw={500}>{tenants[0].name}</Text>
        </Group>
      );
    }

    return (
      <Menu shadow="md" width={220} position="top-start">
        <Menu.Target>
          <UnstyledButton className={classes.mobileButton}>
            <HouseIcon size={20} />
            <Text size="sm" fw={500} style={{ flex: 1 }}>
              {currentTenant?.name ?? 'Sélectionner un foyer'}
            </Text>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Changer de foyer</Menu.Label>
          {tenants.map((tenant) => (
            <Menu.Item
              key={tenant.id.toString()}
              leftSection={<HouseIcon size={18} />}
              rightSection={tenant.id === currentTenantId ? <CheckIcon /> : null}
              onClick={() => setCurrentTenant(tenant)}
            >
              {tenant.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  // Sidebar variant - icon only with tooltip/menu
  // If only one tenant, show tooltip with name
  if (tenants.length === 1) {
    return (
      <Tooltip label={tenants[0].name} position="right" offset={12}>
        <div className={classes.sidebarButton} data-single>
          <HouseIcon size={20} />
        </div>
      </Tooltip>
    );
  }

  return (
    <Menu shadow="md" width={200} position="right-start" offset={12}>
      <Menu.Target>
        <Tooltip label={currentTenant?.name ?? 'Changer de foyer'} position="right" offset={12} openDelay={500}>
          <UnstyledButton className={classes.sidebarButton} data-active={tenants.length > 1 || undefined}>
            <HouseIcon size={20} />
          </UnstyledButton>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Changer de foyer</Menu.Label>
        {tenants.map((tenant) => (
          <Menu.Item
            key={tenant.id.toString()}
            leftSection={<HouseIcon size={18} />}
            rightSection={tenant.id === currentTenantId ? <CheckIcon /> : null}
            onClick={() => setCurrentTenant(tenant)}
          >
            {tenant.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}


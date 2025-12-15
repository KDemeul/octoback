import { Menu, UnstyledButton, Text, Group, Loader, Tooltip, Modal, TextInput, Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyTenants, useUpdateTenant } from '../../hooks';
import { useTenant } from '../../lib/TenantContext';
import { getMyTenants } from '../../gen/octoback/tenants/v1/service-Service_connectquery';
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

function PencilIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

interface TenantSelectorProps {
  variant?: 'sidebar' | 'mobile';
}

export function TenantSelector({ variant = 'sidebar' }: TenantSelectorProps) {
  const { data: tenantsData, isLoading } = useMyTenants();
  const { currentTenantId, setCurrentTenant } = useTenant();
  const queryClient = useQueryClient();
  const updateTenantMutation = useUpdateTenant();
  const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false);
  const [newName, setNewName] = useState('');

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

  const handleOpenRename = () => {
    setNewName(currentTenant?.name ?? '');
    openRename();
  };

  const handleRename = async () => {
    if (!currentTenant || !newName.trim()) return;

    await updateTenantMutation.mutateAsync({
      tenantId: currentTenant.id,
      name: newName.trim(),
      version: currentTenant.version,
    });

    // Invalidate tenants query to refresh the list
    queryClient.invalidateQueries({ queryKey: [getMyTenants.service.typeName] });
    closeRename();
  };

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

  const renameModal = (
    <Modal opened={renameOpened} onClose={closeRename} title="Renommer le foyer" centered>
      <Stack>
        <TextInput
          label="Nom du foyer"
          placeholder="Mon foyer"
          value={newName}
          onChange={(e) => setNewName(e.currentTarget.value)}
          data-autofocus
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeRename}>
            Annuler
          </Button>
          <Button
            onClick={handleRename}
            loading={updateTenantMutation.isPending}
            disabled={!newName.trim() || newName.trim() === currentTenant?.name}
          >
            Renommer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  // Mobile variant - full width with text
  if (variant === 'mobile') {
    if (tenants.length === 1) {
      return (
        <>
          {renameModal}
          <Menu shadow="md" width={220} position="top-start">
            <Menu.Target>
              <UnstyledButton className={classes.mobileButton}>
                <div className={classes.mobileButtonIcon}>
                  <HouseIcon size={20} />
                </div>
                <Text size="sm" fw={500} style={{ flex: 1 }}>{tenants[0].name}</Text>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<PencilIcon size={18} />} onClick={handleOpenRename}>
                Renommer
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </>
      );
    }

    return (
      <>
        {renameModal}
        <Menu shadow="md" width={220} position="top-start">
          <Menu.Target>
            <UnstyledButton className={classes.mobileButton}>
              <div className={classes.mobileButtonIcon}>
                <HouseIcon size={20} />
              </div>
              <Text size="sm" fw={500} style={{ flex: 1 }}>
                {currentTenant?.name ?? 'Sélectionner un foyer'}
              </Text>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
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
            <Menu.Divider />
            <Menu.Item leftSection={<PencilIcon size={18} />} onClick={handleOpenRename}>
              Renommer le foyer
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </>
    );
  }

  // Sidebar variant - icon only with tooltip/menu
  // If only one tenant, show menu with rename option
  if (tenants.length === 1) {
    return (
      <>
        {renameModal}
        <Menu shadow="md" width={200} position="right-start" offset={12}>
          <Menu.Target>
            <Tooltip label={tenants[0].name} position="right" offset={12} openDelay={500}>
              <UnstyledButton className={classes.sidebarButton}>
                <HouseIcon size={20} />
              </UnstyledButton>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<PencilIcon size={18} />} onClick={handleOpenRename}>
              Renommer
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </>
    );
  }

  return (
    <>
      {renameModal}
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
          <Menu.Divider />
          <Menu.Item leftSection={<PencilIcon size={18} />} onClick={handleOpenRename}>
            Renommer le foyer
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}


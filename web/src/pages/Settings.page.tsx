import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Divider,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout/AppLayout';
import {
  useCreateInvitation,
  useLeaveTenant,
  useMyTenants,
  useUpdateTenant,
} from '../hooks';
import { useAuth0 } from '../lib/auth0';
import classes from './Settings.module.css';

function HouseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 12L10 17L20 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}


function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Admin',
  member: 'Membre',
};

const roleColors: Record<string, string> = {
  owner: 'coral',
  admin: 'blue',
  member: 'gray',
};

function TenantCard({
  name,
  role,
  isLoading,
  onLeave,
  onInvite,
  onRename,
}: {
  name: string;
  role: string;
  isLoading: boolean;
  onLeave: () => void;
  onInvite: () => void;
  onRename: () => void;
}) {
  const canInvite = role === 'owner' || role === 'admin';
  const canRename = role === 'owner' || role === 'admin';
  const canLeave = role !== 'owner';

  return (
    <Card className={classes.tenantCard} data-member>
      <Group justify="space-between" align="flex-start">
        <Group gap="md">
          <ThemeIcon size={48} radius="xl" variant="filled" color="coral">
            <HouseIcon />
          </ThemeIcon>
          <Stack gap={4}>
            <Text fw={600} size="lg">
              {name}
            </Text>
            <Badge variant="light" color={roleColors[role] || 'gray'} size="sm">
              {roleLabels[role] || role}
            </Badge>
          </Stack>
        </Group>

        <Group gap="xs">
          {canRename && (
            <Tooltip label="Renommer le foyer">
              <ActionIcon variant="light" color="gray" size="lg" radius="xl" onClick={onRename}>
                <PencilIcon />
              </ActionIcon>
            </Tooltip>
          )}
          {canInvite && (
            <Tooltip label="Inviter quelqu'un">
              <ActionIcon variant="light" color="coral" size="lg" radius="xl" onClick={onInvite}>
                <ShareIcon />
              </ActionIcon>
            </Tooltip>
          )}
          {isLoading ? (
            <Loader size="sm" color="coral" />
          ) : canLeave ? (
            <Button
              variant="subtle"
              color="red"
              size="xs"
              onClick={onLeave}
              className={classes.leaveButton}
            >
              Quitter
            </Button>
          ) : null}
        </Group>
      </Group>
    </Card>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InviteModal({
  opened,
  onClose,
  tenantId,
  tenantName,
}: {
  opened: boolean;
  onClose: () => void;
  tenantId: bigint;
  tenantName: string;
}) {
  const createInvitationMutation = useCreateInvitation();
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleCreate = async () => {
    const result = await createInvitationMutation.mutateAsync({ tenantId });
    if (result.invitation?.inviteCode) {
      // Generate the full invite link
      const link = `${window.location.origin}/invite/${result.invitation.inviteCode}`;
      setInviteLink(link);
    }
  };

  const handleClose = () => {
    setInviteLink(null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={`Inviter dans "${tenantName}"`} centered>
      <Stack gap="md">
        {!inviteLink ? (
          <>
            <Text size="sm" c="dimmed">
              Créez un lien d'invitation à partager avec la personne que vous souhaitez inviter.
              Le lien expire après 7 jours et ne peut être utilisé qu'une seule fois.
            </Text>
            <Button
              color="coral"
              onClick={handleCreate}
              loading={createInvitationMutation.isPending}
              fullWidth
              leftSection={<LinkIcon />}
            >
              Créer un lien d'invitation
            </Button>
          </>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              Partagez ce lien avec la personne que vous souhaitez inviter :
            </Text>
            <Card withBorder p="md">
              <Stack gap="sm">
                <Text
                  size="sm"
                  ff="monospace"
                  style={{
                    wordBreak: 'break-all',
                    lineHeight: 1.5,
                  }}
                >
                  {inviteLink}
                </Text>
                <CopyButton value={inviteLink}>
                  {({ copied, copy }) => (
                    <Button
                      color={copied ? 'teal' : 'coral'}
                      variant="light"
                      onClick={copy}
                      fullWidth
                      leftSection={copied ? <CheckIcon /> : <CopyIcon />}
                    >
                      {copied ? 'Lien copié !' : 'Copier le lien'}
                    </Button>
                  )}
                </CopyButton>
              </Stack>
            </Card>
            <Text size="xs" c="dimmed" ta="center">
              La personne invitée pourra cliquer sur ce lien pour rejoindre automatiquement votre foyer.
            </Text>
            <Button variant="subtle" color="gray" onClick={handleClose} fullWidth>
              Fermer
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}

function RenameModal({
  opened,
  onClose,
  tenantId,
  tenantName,
  tenantVersion,
  onSuccess,
}: {
  opened: boolean;
  onClose: () => void;
  tenantId: bigint;
  tenantName: string;
  tenantVersion: number;
  onSuccess: () => void;
}) {
  const updateTenantMutation = useUpdateTenant();
  const [newName, setNewName] = useState(tenantName);

  // Reset name when modal opens with a different tenant
  useEffect(() => {
    if (opened) {
      setNewName(tenantName);
    }
  }, [opened, tenantName]);

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === tenantName) {
      return;
    }

    await updateTenantMutation.mutateAsync({
      tenantId,
      name: newName.trim(),
      version: tenantVersion,
    });

    onSuccess();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Renommer le foyer" centered>
      <Stack>
        <TextInput
          label="Nom du foyer"
          placeholder="Mon foyer"
          value={newName}
          onChange={(e) => setNewName(e.currentTarget.value)}
          data-autofocus
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleRename}
            loading={updateTenantMutation.isPending}
            disabled={!newName.trim() || newName.trim() === tenantName}
          >
            Renommer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function SettingsPage() {
  const { colorScheme } = useMantineColorScheme();
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const queryClient = useQueryClient();

  const { data: myTenantsData, isLoading: myTenantsLoading, error: tenantsError } = useMyTenants();
  const leaveTenantMutation = useLeaveTenant();

  const [inviteModalOpened, { open: openInviteModal, close: closeInviteModal }] =
    useDisclosure(false);
  const [renameModalOpened, { open: openRenameModal, close: closeRenameModal }] =
    useDisclosure(false);
  const [selectedTenant, setSelectedTenant] = useState<{ id: bigint; name: string; version: number } | null>(null);

  const handleLeave = async (tenantId: bigint) => {
    await leaveTenantMutation.mutateAsync({ tenantId });
    queryClient.invalidateQueries({ queryKey: ['octoback.tenants.v1.Service'] });
  };

  const handleInvite = (tenantId: bigint, tenantName: string, tenantVersion: number) => {
    setSelectedTenant({ id: tenantId, name: tenantName, version: tenantVersion });
    openInviteModal();
  };

  const handleRename = (tenantId: bigint, tenantName: string, tenantVersion: number) => {
    setSelectedTenant({ id: tenantId, name: tenantName, version: tenantVersion });
    openRenameModal();
  };

  // Create a map of tenant ID to membership for quick lookup
  const membershipMap = new Map(
    myTenantsData?.memberships?.map((m) => [m.tenantId, m]) ?? []
  );

  const isLoading = authLoading || myTenantsLoading;

  if (authLoading) {
    return (
      <AppLayout title="Paramètres">
        <Box className={classes.wrapper} data-theme={colorScheme}>
          <Stack align="center" gap="xl" py={100}>
            <Loader size="lg" color="coral" />
            <Text c="dimmed">Chargement...</Text>
          </Stack>
        </Box>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout title="Paramètres">
        <Box className={classes.wrapper} data-theme={colorScheme}>
          <Stack align="center" gap="xl" py={100}>
            <ThemeIcon size={80} radius="xl" variant="light" color="coral">
              <SettingsIcon />
            </ThemeIcon>
            <Title order={2} ta="center">
              Connexion requise
            </Title>
            <Text c="dimmed" ta="center" maw={400}>
              Connectez-vous pour accéder à vos paramètres et gérer vos foyers.
            </Text>
            <Button size="lg" radius="xl" color="coral" onClick={() => loginWithRedirect()}>
              Se connecter
            </Button>
          </Stack>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Paramètres">
      <Box className={classes.wrapper} data-theme={colorScheme}>
        <Box className={classes.content}>
          <Stack gap="xl">
            {/* User Profile Section */}
            <Card className={classes.profileCard}>
              <Group gap="lg">
                <Avatar src={user?.picture} alt={user?.name} size={80} radius="xl" />
                <Stack gap={4}>
                  <Title order={3}>{user?.name}</Title>
                  <Text c="dimmed" size="sm">
                    {user?.email}
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Divider />

            {/* Tenants Section */}
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Stack gap={4}>
                  <Title order={4}>Mes foyers</Title>
                  <Text c="dimmed" size="sm">
                    Gérez vos foyers et invitez d'autres personnes à les rejoindre.
                  </Text>
                </Stack>
                {myTenantsData?.tenants && myTenantsData.tenants.length > 0 && (
                  <Badge size="lg" variant="light" color="coral" leftSection={<CheckIcon />}>
                    {myTenantsData.tenants.length} foyer
                    {myTenantsData.tenants.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </Group>

              {tenantsError && (
                <Alert variant="light" color="red" title="Erreur">
                  Impossible de charger les foyers. Veuillez réessayer.
                </Alert>
              )}

              {isLoading ? (
                <Stack align="center" py="xl">
                  <Loader color="coral" />
                </Stack>
              ) : (
                <Stack gap="md">
                  {myTenantsData?.tenants?.map((tenant) => {
                    const membership = membershipMap.get(tenant.id);
                    return (
                      <TenantCard
                        key={tenant.id.toString()}
                        name={tenant.name}
                        role={membership?.role || 'member'}
                        isLoading={
                          leaveTenantMutation.isPending &&
                          leaveTenantMutation.variables?.tenantId === tenant.id
                        }
                        onLeave={() => handleLeave(tenant.id)}
                        onInvite={() => handleInvite(tenant.id, tenant.name, tenant.version)}
                        onRename={() => handleRename(tenant.id, tenant.name, tenant.version)}
                      />
                    );
                  })}
                </Stack>
              )}

              {myTenantsData?.tenants?.length === 0 && !isLoading && (
                <Card className={classes.emptyCard}>
                  <Stack align="center" gap="md" py="xl">
                    <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                      <HouseIcon />
                    </ThemeIcon>
                    <Text c="dimmed" ta="center">
                      Vous n'êtes membre d'aucun foyer.
                    </Text>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Invite Modal */}
        {selectedTenant && (
          <InviteModal
            opened={inviteModalOpened}
            onClose={closeInviteModal}
            tenantId={selectedTenant.id}
            tenantName={selectedTenant.name}
          />
        )}

        {/* Rename Modal */}
        {selectedTenant && (
          <RenameModal
            opened={renameModalOpened}
            onClose={closeRenameModal}
            tenantId={selectedTenant.id}
            tenantName={selectedTenant.name}
            tenantVersion={selectedTenant.version}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['octoback.tenants.v1.Service'] })}
          />
        )}
      </Box>
    </AppLayout>
  );
}

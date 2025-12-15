import {
  Box,
  Button,
  Card,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAcceptInvitation, useMyTenants } from '../hooks';
import { useAuth0 } from '../lib/auth0';
import { useTenant } from '../lib/TenantContext';

function HouseIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function ErrorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

type AcceptState = 'loading' | 'needs_auth' | 'accepting' | 'success' | 'error';

export function InviteAcceptPage() {
  const { code } = useParams<{ code: string }>();
  const { colorScheme } = useMantineColorScheme();
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCurrentTenantById } = useTenant();
  
  const acceptInvitationMutation = useAcceptInvitation();
  const { refetch: refetchTenants } = useMyTenants();
  
  const [state, setState] = useState<AcceptState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joinedTenantName, setJoinedTenantName] = useState<string | null>(null);
  
  const hasTriedAccepting = useRef(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      setState('loading');
      return;
    }

    // If not authenticated, prompt to login
    if (!isAuthenticated) {
      setState('needs_auth');
      return;
    }

    // If authenticated and haven't tried accepting yet, do it
    if (!hasTriedAccepting.current && code) {
      hasTriedAccepting.current = true;
      setState('accepting');
      
      acceptInvitationMutation.mutate(
        { inviteCode: code },
        {
          onSuccess: async (response) => {
            const tenantId = response.tenant?.id;
            const tenantName = response.tenant?.name;
            
            if (tenantId) {
              // Set the current tenant to the newly joined one
              setCurrentTenantById(tenantId);
              
              // Invalidate tenant queries to refetch the list
              await queryClient.invalidateQueries({ queryKey: ['octoback.tenants.v1.Service'] });
              await refetchTenants();
            }
            
            setJoinedTenantName(tenantName || 'le foyer');
            setState('success');
            
            // Redirect to groceries after a short delay
            setTimeout(() => {
              navigate('/groceries');
            }, 2000);
          },
          onError: (error: Error) => {
            if (error.message.includes('not found') || error.message.includes('invalid')) {
              setErrorMessage('Ce lien d\'invitation est invalide ou n\'existe pas.');
            } else if (error.message.includes('already')) {
              setErrorMessage('Vous êtes déjà membre de ce foyer.');
            } else if (error.message.includes('expired')) {
              setErrorMessage('Ce lien d\'invitation a expiré.');
            } else if (error.message.includes('used')) {
              setErrorMessage('Ce lien d\'invitation a déjà été utilisé.');
            } else {
              setErrorMessage('Une erreur est survenue lors de l\'acceptation de l\'invitation.');
            }
            setState('error');
          },
        }
      );
    }
  }, [authLoading, isAuthenticated, code, acceptInvitationMutation, setCurrentTenantById, queryClient, refetchTenants, navigate]);

  const handleLogin = () => {
    // Store the invite URL to redirect back after login
    loginWithRedirect({
      appState: { returnTo: `/invite/${code}` },
      authorizationParams: {
        connection: 'google-oauth2',
      },
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToGroceries = () => {
    navigate('/groceries');
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: colorScheme === 'dark'
          ? 'linear-gradient(135deg, #1a1b1e 0%, #25262b 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      }}
    >
      <Card
        shadow="xl"
        padding="xl"
        radius="lg"
        withBorder
        style={{ maxWidth: 420, width: '100%' }}
      >
        {/* Loading state */}
        {state === 'loading' && (
          <Stack align="center" gap="lg" py="xl">
            <Loader size="lg" color="coral" />
            <Text c="dimmed">Chargement...</Text>
          </Stack>
        )}

        {/* Needs authentication */}
        {state === 'needs_auth' && (
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} radius="xl" variant="light" color="coral">
              <HouseIcon />
            </ThemeIcon>
            <Title order={2} ta="center">
              Invitation à rejoindre un foyer
            </Title>
            <Text c="dimmed" ta="center">
              Connectez-vous pour accepter l'invitation et rejoindre ce foyer.
            </Text>
            <Button
              fullWidth
              size="lg"
              color="coral"
              radius="xl"
              onClick={handleLogin}
            >
              Se connecter avec Google
            </Button>
            <Button
              fullWidth
              variant="subtle"
              color="gray"
              onClick={handleGoHome}
            >
              Retour à l'accueil
            </Button>
          </Stack>
        )}

        {/* Accepting */}
        {state === 'accepting' && (
          <Stack align="center" gap="lg" py="xl">
            <Loader size="lg" color="coral" />
            <Title order={3} ta="center">
              Acceptation de l'invitation...
            </Title>
            <Text c="dimmed" ta="center">
              Veuillez patienter pendant que nous vous ajoutons au foyer.
            </Text>
          </Stack>
        )}

        {/* Success */}
        {state === 'success' && (
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} radius="xl" variant="light" color="teal">
              <CheckIcon />
            </ThemeIcon>
            <Title order={2} ta="center">
              Bienvenue !
            </Title>
            <Text c="dimmed" ta="center">
              Vous avez rejoint <strong>{joinedTenantName}</strong> avec succès.
            </Text>
            <Text c="dimmed" size="sm" ta="center">
              Redirection automatique vers l'application...
            </Text>
            <Button
              fullWidth
              size="lg"
              color="coral"
              radius="xl"
              onClick={handleGoToGroceries}
            >
              Accéder à l'application
            </Button>
          </Stack>
        )}

        {/* Error */}
        {state === 'error' && (
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} radius="xl" variant="light" color="red">
              <ErrorIcon />
            </ThemeIcon>
            <Title order={2} ta="center">
              Oups !
            </Title>
            <Text c="dimmed" ta="center">
              {errorMessage}
            </Text>
            <Button
              fullWidth
              size="lg"
              color="coral"
              radius="xl"
              onClick={handleGoToGroceries}
            >
              Aller à l'application
            </Button>
            <Button
              fullWidth
              variant="subtle"
              color="gray"
              onClick={handleGoHome}
            >
              Retour à l'accueil
            </Button>
          </Stack>
        )}
      </Card>
    </Box>
  );
}


import {
  ActionIcon,
  Box,
  Container,
  Divider,
  Drawer,
  Group,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation } from 'react-router-dom';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { TenantSelector } from '../TenantSelector/TenantSelector';
import { useAuth0 } from '../../lib/auth0';
import classes from './AppLayout.module.css';

function OctopusLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tentacles */}
      <path
        d="M10 44C10 44 6 54 10 58C12 60 16 58 16 54C16 50 14 46 18 42"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M18 46C18 46 16 56 20 60C22 62 26 60 26 56C26 52 24 48 26 44"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M38 44C38 44 40 56 44 60C46 62 42 62 40 58C38 54 40 50 38 44"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M46 42C46 42 50 54 54 58C56 60 52 60 50 56C48 52 50 46 46 42"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Chef hat - puffy top with outline for visibility */}
      <ellipse cx="32" cy="12" rx="10" ry="5" fill="white" stroke="#ddd" strokeWidth="1" />
      <circle cx="24" cy="10" r="5" fill="white" stroke="#ddd" strokeWidth="1" />
      <circle cx="40" cy="10" r="5" fill="white" stroke="#ddd" strokeWidth="1" />
      <circle cx="32" cy="7" r="5" fill="white" stroke="#ddd" strokeWidth="1" />
      {/* Hat band */}
      <rect x="22" y="14" width="20" height="5" rx="1" fill="white" stroke="#ddd" strokeWidth="1" />

      {/* Head */}
      <ellipse cx="32" cy="32" rx="16" ry="14" fill="currentColor" />

      {/* Eyes */}
      <ellipse cx="26" cy="30" rx="4" ry="5" fill="white" />
      <ellipse cx="38" cy="30" rx="4" ry="5" fill="white" />
      <circle cx="27" cy="31" r="2" fill="#2d3436" />
      <circle cx="39" cy="31" r="2" fill="#2d3436" />
      <circle cx="27.5" cy="30" r="0.8" fill="white" />
      <circle cx="39.5" cy="30" r="0.8" fill="white" />

      {/* Smile */}
      <path
        d="M27 37 Q32 42 37 37"
        stroke="#2d3436"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Rosy cheeks */}
      <ellipse cx="20" cy="34" rx="2.5" ry="1.5" fill="#f68f71" opacity="0.5" />
      <ellipse cx="44" cy="34" rx="2.5" ry="1.5" fill="#f68f71" opacity="0.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function ChefHatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6V13.87Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

function SaltIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L8 6h8l-4-4z" />
      <rect x="6" y="6" width="12" height="16" rx="2" />
      <circle cx="10" cy="12" r="0.5" fill="currentColor" />
      <circle cx="14" cy="14" r="0.5" fill="currentColor" />
      <circle cx="11" cy="16" r="0.5" fill="currentColor" />
      <circle cx="13" cy="10" r="0.5" fill="currentColor" />
    </svg>
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

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

const navItems = [
  { icon: ListIcon, label: 'Listes', path: '/groceries' },
  { icon: ChefHatIcon, label: 'Recettes', path: '/recipes' },
  { icon: CalendarIcon, label: 'Planning', path: '/mealplan' },
  { icon: SaltIcon, label: 'Essentiels', path: '/staples' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  backTo?: string;
  action?: React.ReactNode;
  headerSeparator?: React.ReactNode;
}

export function AppLayout({ children, title, backTo, action, headerSeparator }: AppLayoutProps) {
  const { colorScheme } = useMantineColorScheme();
  const { logout } = useAuth0();
  const location = useLocation();
  const [mobileMenuOpened, { open: openMobileMenu, close: closeMobileMenu }] = useDisclosure(false);

  return (
    <Box className={classes.wrapper} data-theme={colorScheme}>
      {/* Sidebar for desktop */}
      <Box component="aside" className={classes.sidebar}>
        <Box className={classes.sidebarHeader}>
          <Link to="/" className={classes.logoLink}>
            <Box c="coral.5">
              <OctopusLogo size={36} />
            </Box>
          </Link>
        </Box>

        <Box className={classes.sidebarNav}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Tooltip key={item.path} label={item.label} position="right" offset={12}>
                <UnstyledButton
                  component={Link}
                  to={item.path}
                  className={classes.navItem}
                  data-active={isActive || undefined}
                >
                  <item.icon />
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </Box>

        <Box className={classes.sidebarFooter}>
          <TenantSelector variant="sidebar" />
          <Divider w={32} my={4} />
          <Tooltip label="Paramètres" position="right" offset={12}>
            <UnstyledButton
              component={Link}
              to="/settings"
              className={classes.navItem}
              data-active={location.pathname === '/settings' || undefined}
            >
              <SettingsIcon />
            </UnstyledButton>
          </Tooltip>
          <ColorSchemeToggle />
          <Tooltip label="Déconnexion" position="right" offset={12}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              <LogoutIcon />
            </ActionIcon>
          </Tooltip>
        </Box>
      </Box>

      {/* Main content */}
      <Box className={classes.main}>
        {title && (
          <Box className={classes.pageHeader} data-has-separator={headerSeparator ? true : undefined}>
            <Container size="lg">
              <Group justify="space-between" align="center">
                <Group gap="md">
                  {backTo && (
                    <UnstyledButton component={Link} to={backTo} className={classes.backButton}>
                      ←
                    </UnstyledButton>
                  )}
                  <Text className={classes.pageTitle}>{title}</Text>
                </Group>
                {action}
              </Group>
            </Container>
            {headerSeparator && (
              <Box className={classes.headerSeparator}>
                {headerSeparator}
              </Box>
            )}
          </Box>
        )}
        <Box className={classes.content}>
          <Container size="lg" py="xl">
            {children}
          </Container>
        </Box>
      </Box>

      {/* Bottom navigation for mobile */}
      <Box component="nav" className={classes.bottomNav}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <UnstyledButton
              key={item.path}
              component={Link}
              to={item.path}
              className={classes.bottomNavItem}
              data-active={isActive || undefined}
            >
              <item.icon />
              <Text size="xs" mt={4} className={classes.bottomNavLabel}>
                {item.label}
              </Text>
            </UnstyledButton>
          );
        })}
        <UnstyledButton
          className={classes.bottomNavItem}
          onClick={openMobileMenu}
        >
          <MoreIcon />
          <Text size="xs" mt={4} className={classes.bottomNavLabel}>
            Plus
          </Text>
        </UnstyledButton>
      </Box>

      {/* Mobile menu drawer */}
      <Drawer
        opened={mobileMenuOpened}
        onClose={closeMobileMenu}
        position="bottom"
        size="auto"
        withCloseButton={false}
        classNames={{
          content: classes.mobileDrawer,
          body: classes.mobileDrawerBody,
        }}
      >
        <Box className={classes.mobileDrawerHandle} />
        
        <Box className={classes.mobileDrawerSection}>
          <TenantSelector variant="mobile" />
        </Box>
        
        <Box className={classes.mobileDrawerSection}>
          <UnstyledButton
            component={Link}
            to="/settings"
            className={classes.mobileMenuItem}
            onClick={closeMobileMenu}
          >
            <Box className={classes.mobileMenuIcon}>
              <SettingsIcon />
            </Box>
            <Text size="sm" fw={500}>Paramètres</Text>
          </UnstyledButton>
          
          <UnstyledButton
            className={classes.mobileMenuItem}
            onClick={() => {
              closeMobileMenu();
              logout({ logoutParams: { returnTo: window.location.origin } });
            }}
          >
            <Box className={classes.mobileMenuIcon} c="red.6">
              <LogoutIcon />
            </Box>
            <Text size="sm" fw={500} c="red.6">Déconnexion</Text>
          </UnstyledButton>
        </Box>

        <Box className={classes.mobileDrawerFooter}>
          <ColorSchemeToggle />
        </Box>
      </Drawer>
    </Box>
  );
}

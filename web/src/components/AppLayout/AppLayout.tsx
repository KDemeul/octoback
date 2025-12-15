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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left outer tentacle */}
      <path d="M28 48 Q12 52 8 65 Q5 75 12 78 Q18 80 20 72 Q22 64 28 55" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="14" cy="68" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="18" cy="74" rx="2" ry="1.5" fill="#f5a89a"/>
      
      {/* Left inner tentacle */}
      <path d="M35 55 Q25 62 22 75 Q20 85 28 87 Q35 88 36 78 Q37 68 38 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="26" cy="76" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="30" cy="82" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Right outer tentacle */}
      <path d="M72 48 Q88 52 92 65 Q95 75 88 78 Q82 80 80 72 Q78 64 72 55" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="86" cy="68" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="82" cy="74" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Right inner tentacle */}
      <path d="M65 55 Q75 62 78 75 Q80 85 72 87 Q65 88 64 78 Q63 68 62 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="74" cy="76" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="70" cy="82" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Bottom left tentacle */}
      <path d="M42 58 Q38 70 40 82 Q42 92 50 90 Q56 88 52 78 Q48 68 46 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="44" cy="78" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="48" cy="85" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Bottom right tentacle */}
      <path d="M58 58 Q62 70 60 82 Q58 92 50 90 Q44 88 48 78 Q52 68 54 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="56" cy="78" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="52" cy="85" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Octopus head */}
      <ellipse cx="50" cy="42" rx="24" ry="22" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>

      {/* Eyes - white part */}
      <ellipse cx="40" cy="42" rx="7" ry="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>
      <ellipse cx="60" cy="42" rx="7" ry="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>

      {/* Eyes - pupils */}
      <circle cx="41" cy="43" r="3.5" fill="#1e2a3a"/>
      <circle cx="61" cy="43" r="3.5" fill="#1e2a3a"/>

      {/* Eye shine */}
      <circle cx="43" cy="41" r="1.2" fill="white"/>
      <circle cx="63" cy="41" r="1.2" fill="white"/>

      {/* Smile */}
      <path d="M42 52 Q50 58 58 52" stroke="#1e2a3a" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Rosy cheeks */}
      <ellipse cx="30" cy="48" rx="4" ry="2.5" fill="#f5a89a" opacity="0.7"/>
      <ellipse cx="70" cy="48" rx="4" ry="2.5" fill="#f5a89a" opacity="0.7"/>

      {/* Chef hat - puffy top */}
      <ellipse cx="50" cy="18" rx="14" ry="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>
      <circle cx="38" cy="14" r="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>
      <circle cx="62" cy="14" r="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>
      <circle cx="50" cy="10" r="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>

      {/* Hat band */}
      <rect x="36" y="22" width="28" height="6" rx="1" fill="white" stroke="#1e2a3a" strokeWidth="1"/>

      {/* Cover hat seams */}
      <ellipse cx="50" cy="16" rx="10" ry="6" fill="white"/>
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

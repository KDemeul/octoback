import {
  Box,
  Button,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { useAuth0 } from '../lib/auth0';
import classes from './Home.module.css';

function OctopusLogo({ size = 48 }: { size?: number }) {
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

function RecipeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6H20M4 10H20M4 14H14M4 18H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 14L20 16L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="15" r="1.5" fill="currentColor" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      <circle cx="16" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 6H22L20 16H8L6 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M6 6L5 3H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="20" r="2" fill="currentColor" />
      <circle cx="18" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const features = [
  {
    icon: RecipeIcon,
    title: 'Stockage de recettes',
    description:
      'Stockez et organisez facilement vos recettes préférées en un seul endroit. Ajoutez des recettes du web ou saisissez-les manuellement.',
    color: 'coral',
  },
  {
    icon: CalendarIcon,
    title: 'Planification de repas',
    description:
      'Planifiez vos repas pour la semaine avec la possibilité d\'attribuer des recettes à des jours et repas spécifiques.',
    color: 'sage',
  },
  {
    icon: CartIcon,
    title: 'Liste d\'épicerie',
    description:
      'OctoPlanner génère automatiquement votre liste d\'épicerie avec les ingrédients nécessaires, en tenant compte de ce que vous avez déjà.',
    color: 'coral',
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: () => React.ReactElement;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <Box className={classes.featureCard} style={{ animationDelay: `${delay}ms` }}>
      <ThemeIcon size={64} radius="xl" variant="light" color={color} mb="lg">
        <Icon />
      </ThemeIcon>
      <Title order={3} mb="sm" className={classes.featureTitle}>
        {title}
      </Title>
      <Text c="dimmed" size="md" lh={1.6}>
        {description}
      </Text>
    </Box>
  );
}

export function HomePage() {
  const { colorScheme } = useMantineColorScheme();
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    <Box className={classes.wrapper} data-theme={colorScheme}>
      {/* Background decoration */}
      <Box className={classes.bgDecoration} />
      <Box className={classes.bgDecoration2} />

      {/* Header */}
      <Box component="header" className={classes.header}>
        <Container size="xl">
          <Group justify="space-between" h={70}>
            <Group gap="xs">
              <Box c="coral.5">
                <OctopusLogo size={40} />
              </Box>
              <Text
                fw={700}
                size="xl"
                style={{ letterSpacing: '-0.5px' }}
              >
                OctoPlanner
              </Text>
            </Group>
            <Group>
              <ColorSchemeToggle />
              {!isAuthenticated && (
                <Button
                  variant="default"
                  radius="xl"
                  leftSection={<GoogleIcon size={18} />}
                  onClick={() =>
                    loginWithRedirect({
                      appState: { returnTo: '/groceries' },
                      authorizationParams: {
                        connection: 'google-oauth2',
                      },
                    })
                  }
                >
                  Continuer avec Google
                </Button>
              )}
              {isAuthenticated && (
                <Button
                  variant="light"
                  color="coral"
                  radius="xl"
                  onClick={() => navigate('/groceries')}
                >
                  Accéder à l'app
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container size="lg" className={classes.heroContainer}>
        <Stack align="center" gap="xl" className={classes.hero}>
          <Box className={classes.badge}>
            <Text size="sm" fw={600}>
              🧑🏼‍🍳 Cuisiner n'a jamais été aussi simple
            </Text>
          </Box>

          <Title className={classes.title} ta="center">
            Planifiez vos repas,
            <br />
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: 'coral.5', to: 'coral.7', deg: 135 }}
            >
              simplifiez votre vie
            </Text>
          </Title>

          <Text
            c="dimmed"
            size="xl"
            maw={600}
            ta="center"
            lh={1.7}
            className={classes.subtitle}
          >
            OctoPlanner est votre assistant culinaire. Stockez vos recettes, planifiez vos repas 
            et générez votre liste d'épicerie en quelques clics.
          </Text>

          {isAuthenticated ? (
            <Button
              size="xl"
              radius="xl"
              color="coral"
              className={classes.ctaButton}
              mt="md"
              onClick={() => navigate('/groceries')}
            >
              Accéder à l'app
            </Button>
          ) : (
            <Button
              size="xl"
              radius="xl"
              variant="default"
              className={classes.ctaButton}
              mt="md"
              leftSection={<GoogleIcon size={24} />}
              onClick={() =>
                loginWithRedirect({
                  appState: { returnTo: '/groceries' },
                  authorizationParams: {
                    connection: 'google-oauth2',
                  },
                })
              }
            >
              Continuer avec Google
            </Button>
          )}
        </Stack>

        {/* Hero Visual */}
        <Box className={classes.heroVisual}>
          <Box className={classes.floatingCard} style={{ '--delay': '0s' } as React.CSSProperties}>
            <Text size="xl" mb="xs">📅</Text>
            <Text size="sm" fw={600}>Lundi</Text>
            <Text size="xs" c="dimmed">Poulet rôti</Text>
          </Box>
          <Box className={classes.floatingCard} style={{ '--delay': '0.2s', '--x': '120px', '--y': '60px' } as React.CSSProperties}>
            <Text size="xl" mb="xs">🥗</Text>
            <Text size="sm" fw={600}>Mardi</Text>
            <Text size="xs" c="dimmed">Salade César</Text>
          </Box>
          <Box className={classes.floatingCard} style={{ '--delay': '0.4s', '--x': '-100px', '--y': '120px' } as React.CSSProperties}>
            <Text size="xl" mb="xs">🍝</Text>
            <Text size="sm" fw={600}>Mercredi</Text>
            <Text size="xs" c="dimmed">Spaghetti</Text>
          </Box>
          <Box className={classes.floatingCard} style={{ '--delay': '0.6s', '--x': '80px', '--y': '180px' } as React.CSSProperties}>
            <Text size="xl" mb="xs">🛒</Text>
            <Text size="sm" fw={600}>Liste</Text>
            <Text size="xs" c="dimmed">8 articles</Text>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Box className={classes.featuresSection}>
        <Container size="lg">
          <Stack align="center" mb={60}>
            <Text c="coral.5" fw={700} size="sm" tt="uppercase" style={{ letterSpacing: '2px' }}>
              Fonctionnalités
            </Text>
            <Title order={2} ta="center" className={classes.sectionTitle}>
              Tout ce dont vous avez besoin
              <br />
              pour cuisiner sereinement
            </Title>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={40}>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 150}
              />
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className={classes.ctaSection}>
        <Container size="md">
          <Box className={classes.ctaCard}>
            <Box c="coral.5" mb="lg">
              <OctopusLogo size={64} />
            </Box>
            <Title order={2} ta="center" mb="md" c="white">
              Prêt à simplifier vos repas ?
            </Title>
            <Text c="gray.4" ta="center" size="lg" maw={500} mx="auto" mb="xl">
              Rejoignez des milliers de cuisiniers qui ont déjà adopté OctoPlanner
              pour organiser leur semaine culinaire.
            </Text>
            {isAuthenticated ? (
              <Button
                size="xl"
                radius="xl"
                color="white"
                c="coral.6"
                onClick={() => navigate('/groceries')}
              >
                Accéder à l'app
              </Button>
            ) : (
              <Button
                size="xl"
                radius="xl"
                variant="white"
                leftSection={<GoogleIcon size={24} />}
                onClick={() =>
                  loginWithRedirect({
                    appState: { returnTo: '/groceries' },
                    authorizationParams: {
                      connection: 'google-oauth2',
                    },
                  })
                }
              >
                Continuer avec Google
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" className={classes.footer}>
        <Container size="xl">
          <Group justify="space-between">
            <Group gap="xs">
              <Box c="coral.5">
                <OctopusLogo size={32} />
              </Box>
              <Text fw={600}>OctoPlanner</Text>
            </Group>
            <Text size="sm" c="dimmed">
              © 2024 OctoPlanner. Fait avec ❤️ pour les amoureux de la cuisine.
            </Text>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}

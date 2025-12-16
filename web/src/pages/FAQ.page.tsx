import {
  Accordion,
  Box,
  Button,
  Container,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import classes from './FAQ.module.css';

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function StaplesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M2 21V18C2 15.7909 3.79086 14 6 14H12C14.2091 14 16 15.7909 16 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M18 14H19C20.6569 14 22 15.3431 22 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const tutorialSections = [
  {
    id: 'recipes',
    icon: RecipeIcon,
    title: '1. Recettes',
    color: 'sage',
    screenshot: '/screenshots/recipes.png',
    content: `Les recettes sont le cœur d'OctoPlanner. Chaque recette contient la liste des ingrédients nécessaires à sa préparation.

**Comment ajouter une recette ?**
- Cliquez sur "Nouvelle recette" en haut de la page
- Vous pouvez créer une recette manuellement ou **importer depuis une URL**
- Pour l'import URL, OctoPlanner utilise l'intelligence artificielle pour analyser le contenu de la page et extraire automatiquement le nom, les ingrédients et les quantités

**Astuce :** L'import depuis URL fonctionne avec la plupart des sites de recettes populaires !`,
  },
  {
    id: 'mealplan',
    icon: CalendarIcon,
    title: '2. Planning de la semaine',
    color: 'sage',
    screenshot: '/screenshots/mealplan.png',
    content: `Le planning vous permet d'organiser vos repas sur 7 jours, centré sur aujourd'hui.

**Comment ça marche ?**
- Le planning affiche toujours 7 jours avec le jour actuel au centre
- Glissez une recette sur un jour pour l'ajouter au planning
- Cliquez sur "Ajouter" pour ajouter une recette à un jour

**Important :** Vous devez sélectionner une liste de courses liée en haut de la page. Tous les ingrédients des recettes du planning seront automatiquement ajoutés à cette liste !

**Note :** Les recettes des jours "passés" peuvent apparaître dans les jours "futurs" car le planning fait une rotation. Supprimez simplement les recettes une fois cuisinées.`,
  },
  {
    id: 'groceries',
    icon: CartIcon,
    title: '3. Listes de courses',
    color: 'coral',
    screenshot: '/screenshots/groceries.png',
    content: `Créez autant de listes de courses que nécessaire (par magasin, par occasion...).

**Deux façons d'ajouter des articles :**
1. **Manuellement** : Tapez un produit et cliquez sur "+"
2. **Automatiquement** : Via le planning de la semaine - les ingrédients des recettes planifiées s'ajoutent automatiquement à la liste liée

**Organisation :**
- Chaque liste peut être associée à un magasin différent (Grand frais, Chronodrive, Pharmacie...)
- Cochez les articles au fur et à mesure de vos achats
- Supprimez une liste quand vous n'en avez plus besoin`,
  },
  {
    id: 'staples',
    icon: StaplesIcon,
    title: '4. Essentiels (produits de base)',
    color: 'coral',
    screenshot: '/screenshots/staples.png',
    content: `Les essentiels sont pour les produits que vous achetez **systématiquement** chaque semaine.

**Exemple d'utilisation :**
- Goûters pour les enfants (compotes, petits écoliers, petits lus...)
- Produits laitiers de base (lait, kiri, babybel...)
- Produits d'hygiène récurrents

**Comment ça marche ?**
1. Créez une liste d'essentiels
2. Associez-la à une liste de courses
3. Tous les produits de la liste d'essentiels apparaîtront **automatiquement** dans la liste de courses associée

**Astuce :** Pratique pour ne jamais oublier les indispensables du quotidien !`,
  },
  {
    id: 'teams',
    icon: TeamIcon,
    title: '5. Partage en équipe (foyers)',
    color: 'sage',
    screenshot: '/screenshots/teams.png',
    content: `Partagez vos listes et recettes avec votre famille ou colocataires.

**Comment inviter quelqu'un ?**
1. Allez dans **Paramètres** (menu "Plus" > "Paramètres")
2. Trouvez votre foyer et cliquez sur l'icône de partage
3. Cliquez sur "Créer un lien d'invitation"
4. Partagez le lien avec la personne à inviter

**Une fois dans l'équipe :**
- Tous les membres voient les mêmes listes de courses
- Tous les membres voient les mêmes recettes
- Tous les membres voient le même planning
- Les modifications sont synchronisées en temps réel

**Note :** Le lien d'invitation expire après 7 jours et ne peut être utilisé qu'une seule fois.`,
  },
];

export function FAQPage() {
  const { colorScheme } = useMantineColorScheme();
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
              <Button
                variant="subtle"
                color="gray"
                leftSection={<BackIcon />}
                onClick={() => navigate('/')}
              >
                Retour
              </Button>
            </Group>
            <Group gap="xs">
              <Box c="coral.5">
                <OctopusLogo size={40} />
              </Box>
              <Text fw={700} size="xl" style={{ letterSpacing: '-0.5px' }}>
                OctoPlanner
              </Text>
            </Group>
            <ColorSchemeToggle />
          </Group>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container size="md" className={classes.heroContainer}>
        <Stack align="center" gap="xl" className={classes.hero}>
          <Box className={classes.badge}>
            <Text size="sm" fw={600}>
              📚 Guide d'utilisation
            </Text>
          </Box>

          <Title className={classes.title} ta="center">
            Comment utiliser
            <br />
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: 'coral.5', to: 'coral.7', deg: 135 }}
            >
              OctoPlanner ?
            </Text>
          </Title>

          <Text
            c="dimmed"
            size="lg"
            maw={600}
            ta="center"
            lh={1.7}
            className={classes.subtitle}
          >
            Découvrez toutes les fonctionnalités d'OctoPlanner et apprenez à organiser
            vos repas comme un pro.
          </Text>
        </Stack>
      </Container>

      {/* Tutorial Sections */}
      <Container size="md" className={classes.tutorialContainer}>
        <Accordion
          variant="separated"
          radius="lg"
          defaultValue="recipes"
          classNames={{
            item: classes.accordionItem,
            control: classes.accordionControl,
            content: classes.accordionContent,
            chevron: classes.accordionChevron,
          }}
        >
          {tutorialSections.map((section) => (
            <Accordion.Item key={section.id} value={section.id}>
              <Accordion.Control>
                <Group gap="md">
                  <ThemeIcon size={44} radius="xl" variant="light" color={section.color}>
                    <section.icon />
                  </ThemeIcon>
                  <Text fw={600} size="lg">
                    {section.title}
                  </Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="lg">
                  {section.screenshot && (
                    <Box className={classes.screenshotWrapper}>
                      <Image
                        src={section.screenshot}
                        alt={section.title}
                        radius="md"
                        className={classes.screenshot}
                        fallbackSrc="https://placehold.co/375x667/f5f5f5/ccc?text=Screenshot"
                      />
                    </Box>
                  )}
                  <Text
                    className={classes.tutorialText}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {section.content.split('**').map((part, index) =>
                      index % 2 === 1 ? (
                        <Text key={index} component="span" fw={600}>
                          {part}
                        </Text>
                      ) : (
                        part
                      )
                    )}
                  </Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>

      {/* CTA Section */}
      <Container size="md" className={classes.ctaContainer}>
        <Box className={classes.ctaCard}>
          <Stack align="center" gap="lg">
            <Box c="coral.5">
              <OctopusLogo size={56} />
            </Box>
            <Title order={3} ta="center" c="white">
              Prêt à commencer ?
            </Title>
            <Text c="gray.4" ta="center" maw={400}>
              Connectez-vous et commencez à organiser vos repas dès maintenant.
            </Text>
            <Button
              size="lg"
              radius="xl"
              color="white"
              c="coral.6"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </Button>
          </Stack>
        </Box>
      </Container>

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


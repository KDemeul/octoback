import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout/AppLayout';
import classes from './NotFound.module.css';

function SadOctopusIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left outer tentacle - droopy */}
      <path d="M28 48 Q8 58 6 75 Q5 88 14 90 Q22 91 22 82 Q22 72 28 55" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="12" cy="78" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="17" cy="85" rx="2" ry="1.5" fill="#f5a89a"/>
      
      {/* Left inner tentacle */}
      <path d="M35 55 Q22 68 20 85 Q19 97 28 98 Q36 98 37 88 Q38 75 38 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="24" cy="86" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="28" cy="93" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Right outer tentacle - droopy */}
      <path d="M72 48 Q92 58 94 75 Q95 88 86 90 Q78 91 78 82 Q78 72 72 55" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="88" cy="78" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="83" cy="85" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Right inner tentacle */}
      <path d="M65 55 Q78 68 80 85 Q81 97 72 98 Q64 98 63 88 Q62 75 62 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="76" cy="86" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="72" cy="93" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Bottom left tentacle */}
      <path d="M42 58 Q35 76 38 92 Q40 102 50 100 Q58 98 54 88 Q50 76 48 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="42" cy="88" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="46" cy="95" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Bottom right tentacle */}
      <path d="M58 58 Q65 76 62 92 Q60 102 50 100 Q42 98 46 88 Q50 76 52 58" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>
      <ellipse cx="58" cy="88" rx="2.5" ry="1.8" fill="#f5a89a"/>
      <ellipse cx="54" cy="95" rx="2" ry="1.5" fill="#f5a89a"/>

      {/* Octopus head */}
      <ellipse cx="50" cy="42" rx="24" ry="22" fill="currentColor" stroke="#1e2a3a" strokeWidth="1.5"/>

      {/* Eyes - white part */}
      <ellipse cx="40" cy="42" rx="7" ry="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>
      <ellipse cx="60" cy="42" rx="7" ry="8" fill="white" stroke="#1e2a3a" strokeWidth="1"/>

      {/* Eyes - pupils looking down */}
      <circle cx="40" cy="46" r="3.5" fill="#1e2a3a"/>
      <circle cx="60" cy="46" r="3.5" fill="#1e2a3a"/>

      {/* Eye shine */}
      <circle cx="42" cy="44" r="1.2" fill="white"/>
      <circle cx="62" cy="44" r="1.2" fill="white"/>

      {/* Sad mouth */}
      <path d="M42 55 Q50 50 58 55" stroke="#1e2a3a" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Rosy cheeks */}
      <ellipse cx="30" cy="48" rx="4" ry="2.5" fill="#f5a89a" opacity="0.7"/>
      <ellipse cx="70" cy="48" rx="4" ry="2.5" fill="#f5a89a" opacity="0.7"/>

      {/* Question mark instead of chef hat */}
      <text x="50" y="22" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1e2a3a">?</text>
    </svg>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Page introuvable">
      <Box className={classes.wrapper}>
        <Stack align="center" gap="xl" py={60}>
          <ThemeIcon size={120} radius="xl" variant="light" color="coral">
            <SadOctopusIcon />
          </ThemeIcon>

          <Title className={classes.errorCode}>404</Title>

          <Stack align="center" gap="sm">
            <Title order={2} ta="center">
              Oups ! Page introuvable
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={450} lh={1.7}>
              On dirait que cette page s'est perdue dans les profondeurs de l'océan.
            </Text>
          </Stack>

          <Group mt="md">
            <Button
              size="lg"
              radius="xl"
              color="coral"
              onClick={() => navigate('/groceries')}
            >
              Aller aux listes
            </Button>
            <Button
              size="lg"
              radius="xl"
              variant="light"
              color="coral"
              onClick={() => navigate(-1)}
            >
              Page précédente
            </Button>
          </Group>
        </Stack>
      </Box>
    </AppLayout>
  );
}

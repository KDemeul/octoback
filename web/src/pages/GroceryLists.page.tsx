import { useState, useEffect } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout/AppLayout';
import { useGroceryLists, useCreateGroceryList, useDeleteGroceryList } from '../hooks/use-groceries';
import { GroceryList } from '../gen/octoback/groceries/v1/groceries_pb';
import { useQueryClient } from '@tanstack/react-query';
import classes from './GroceryLists.module.css';

function CartIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6L5 3H2" />
      <circle cx="9" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function EmptyState() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box className={classes.emptyState} data-theme={colorScheme}>
      <Box className={classes.emptyIcon}>
        <CartIcon size={64} />
      </Box>
      <Text className={classes.emptyTitle}>Aucune liste</Text>
      <Text c="dimmed" size="lg" maw={400} ta="center" lh={1.6}>
        Créez votre première liste de courses pour commencer à organiser vos achats.
      </Text>
    </Box>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Aujourd'hui";
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }
}

interface GroceryListCardProps {
  list: GroceryList;
  onDelete: (id: bigint) => void;
  delay: number;
}

function GroceryListCard({ list, onDelete, delay }: GroceryListCardProps) {
  const { colorScheme } = useMantineColorScheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    // Detect touch device
    const hasTouch = window.matchMedia('(hover: none)').matches;
    setIsTouchDevice(hasTouch);
  }, []);
  
  const createTime = list.createTime ? new Date(Number(list.createTime.seconds) * 1000) : new Date();
  
  // Show delete button on hover OR always on touch devices
  const showDelete = isHovered || isTouchDevice;

  return (
    <UnstyledButton
      component={Link}
      to={`/groceries/${list.id}`}
      className={classes.listCard}
      data-theme={colorScheme}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box className={classes.cardPattern} />
      
      <Group justify="space-between" align="flex-start" mb="lg" style={{ position: 'relative', zIndex: 1 }}>
        <ThemeIcon
          size={48}
          radius="xl"
          variant="light"
          color="coral"
          className={classes.cardIcon}
        >
          <CartIcon size={24} />
        </ThemeIcon>
        
        {showDelete && (
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(list.id);
            }}
            className={classes.deleteButton}
          >
            <TrashIcon />
          </ActionIcon>
        )}
      </Group>

      <Stack gap="xs" style={{ position: 'relative', zIndex: 1 }}>
        <Text className={classes.cardTitle}>{list.name}</Text>
        <Badge
          variant="dot"
          color="sage"
          size="sm"
          className={classes.dateBadge}
        >
          {formatDate(createTime)}
        </Badge>
      </Stack>
      
      <Box className={classes.cardArrow}>→</Box>
    </UnstyledButton>
  );
}

export function GroceryListsPage() {
  const { colorScheme } = useMantineColorScheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [newListName, setNewListName] = useState('');
  
  const { data, isLoading } = useGroceryLists();
  const createMutation = useCreateGroceryList();
  const deleteMutation = useDeleteGroceryList();
  const queryClient = useQueryClient();

  const lists = data?.groceryLists ?? [];

  const handleCreate = async () => {
    if (!newListName.trim()) return;

    await createMutation.mutateAsync({ name: newListName.trim() });
    queryClient.invalidateQueries({ queryKey: ['octoback.groceries.v1.Service', 'ListGroceryLists'] });
    setNewListName('');
    close();
  };

  const handleDelete = async (id: bigint) => {
    await deleteMutation.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: ['octoback.groceries.v1.Service', 'ListGroceryLists'] });
  };

  return (
    <AppLayout
      title="Mes listes"
      action={
        <Button
          leftSection={<PlusIcon />}
          color="coral"
          radius="xl"
          onClick={open}
          className={classes.createButton}
        >
          Nouvelle liste
        </Button>
      }
    >
      {isLoading ? (
        <Box className={classes.loadingState}>
          <Loader color="coral" size="lg" />
        </Box>
      ) : lists.length === 0 ? (
        <EmptyState />
      ) : (
        <SimpleGrid
          cols={{ base: 1, xs: 2, md: 3 }}
          spacing={{ base: 'md', md: 'lg' }}
          className={classes.grid}
        >
          {lists.map((list, index) => (
            <GroceryListCard
              key={list.id.toString()}
              list={list}
              onDelete={handleDelete}
              delay={index * 50}
            />
          ))}
          
          {/* Add new list card */}
          <UnstyledButton
            className={classes.addCard}
            data-theme={colorScheme}
            onClick={open}
          >
            <Box className={classes.addIcon}>
              <PlusIcon />
            </Box>
            <Text size="sm" c="dimmed" fw={500}>
              Ajouter une liste
            </Text>
          </UnstyledButton>
        </SimpleGrid>
      )}

      {/* Create Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Nouvelle liste"
        centered
        radius="lg"
        classNames={{
          title: classes.modalTitle,
          content: classes.modalContent,
        }}
      >
        <Stack gap="lg">
          <TextInput
            label="Nom de la liste"
            placeholder="Ex: Courses de la semaine"
            value={newListName}
            onChange={(e) => setNewListName(e.currentTarget.value)}
            size="md"
            radius="md"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={close} radius="md">
              Annuler
            </Button>
            <Button
              color="coral"
              onClick={handleCreate}
              loading={createMutation.isPending}
              radius="md"
            >
              Créer
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppLayout>
  );
}


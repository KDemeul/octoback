import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Select,
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
import { useStapleLists, useCreateStapleList, useDeleteStapleList } from '../hooks/use-staples';
import { useGroceryLists } from '../hooks/use-groceries';
import { StapleList } from '../gen/octoback/staples/v1/staples_pb';
import { useQueryClient } from '@tanstack/react-query';
import classes from './Staples.module.css';

function SaltIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L8 6h8l-4-4z" />
      <rect x="6" y="6" width="12" height="16" rx="2" />
      <circle cx="10" cy="12" r="0.5" fill="currentColor" />
      <circle cx="14" cy="14" r="0.5" fill="currentColor" />
      <circle cx="11" cy="16" r="0.5" fill="currentColor" />
      <circle cx="13" cy="10" r="0.5" fill="currentColor" />
      <circle cx="9" cy="18" r="0.5" fill="currentColor" />
      <circle cx="15" cy="18" r="0.5" fill="currentColor" />
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

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function EmptyState() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box className={classes.emptyState} data-theme={colorScheme}>
      <Box className={classes.emptyIcon}>
        <SaltIcon size={64} />
      </Box>
      <Text className={classes.emptyTitle}>Aucune liste de base</Text>
      <Text c="dimmed" size="lg" maw={400} ta="center" lh={1.6}>
        Créez des listes de produits essentiels (huile, sel, épices...) et associez-les à vos listes de courses.
      </Text>
    </Box>
  );
}

interface StapleListCardProps {
  list: StapleList;
  groceryListName?: string;
  onDelete: (id: bigint) => void;
  delay: number;
}

function StapleListCard({ list, groceryListName, onDelete, delay }: StapleListCardProps) {
  const { colorScheme } = useMantineColorScheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <UnstyledButton
      component={Link}
      to={`/staples/${list.id}`}
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
          color="amber"
          className={classes.cardIcon}
        >
          <SaltIcon size={24} />
        </ThemeIcon>

        {isHovered && (
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
        {groceryListName ? (
          <Badge
            variant="light"
            color="coral"
            size="sm"
            leftSection={<LinkIcon />}
            className={classes.linkBadge}
          >
            {groceryListName}
          </Badge>
        ) : (
          <Badge
            variant="dot"
            color="gray"
            size="sm"
          >
            Non liée
          </Badge>
        )}
      </Stack>

      <Box className={classes.cardArrow}>→</Box>
    </UnstyledButton>
  );
}

export function StaplesPage() {
  const { colorScheme } = useMantineColorScheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [newListName, setNewListName] = useState('');
  const [selectedGroceryList, setSelectedGroceryList] = useState<string | null>(null);

  const { data, isLoading } = useStapleLists();
  const { data: groceryListsData } = useGroceryLists();
  const createMutation = useCreateStapleList();
  const deleteMutation = useDeleteStapleList();
  const queryClient = useQueryClient();

  const lists = data?.stapleLists ?? [];
  const groceryLists = groceryListsData?.groceryLists ?? [];

  // Create a map of grocery list ID to name for quick lookup
  const groceryListMap = new Map(
    groceryLists.map(gl => [gl.id.toString(), gl.name])
  );

  const handleCreate = async () => {
    if (!newListName.trim()) return;

    await createMutation.mutateAsync({
      name: newListName.trim(),
      groceryListId: selectedGroceryList ? BigInt(selectedGroceryList) : BigInt(0),
    });
    queryClient.invalidateQueries({ queryKey: ['octoback.staples.v1.Service', 'ListStapleLists'] });
    setNewListName('');
    setSelectedGroceryList(null);
    close();
  };

  const handleDelete = async (id: bigint) => {
    await deleteMutation.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: ['octoback.staples.v1.Service', 'ListStapleLists'] });
  };

  const groceryListOptions = groceryLists.map(gl => ({
    value: gl.id.toString(),
    label: gl.name,
  }));

  return (
    <AppLayout
      title="Essentiels"
      action={
        <Button
          leftSection={<PlusIcon />}
          color="amber"
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
          <Loader color="amber" size="lg" />
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
            <StapleListCard
              key={list.id.toString()}
              list={list}
              groceryListName={list.groceryListId ? groceryListMap.get(list.groceryListId.toString()) : undefined}
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
        onClose={() => {
          close();
          setNewListName('');
          setSelectedGroceryList(null);
        }}
        title="Nouvelle liste de base"
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
            placeholder="Ex: Épicerie de base"
            value={newListName}
            onChange={(e) => setNewListName(e.currentTarget.value)}
            size="md"
            radius="md"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <Select
            label="Associer à une liste de courses"
            placeholder="Sélectionner une liste (optionnel)"
            data={groceryListOptions}
            value={selectedGroceryList}
            onChange={setSelectedGroceryList}
            size="md"
            radius="md"
            clearable
            searchable
          />
          <Text size="xs" c="dimmed">
            Les produits de cette liste apparaîtront automatiquement dans la liste de courses associée.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                close();
                setNewListName('');
                setSelectedGroceryList(null);
              }}
              radius="md"
            >
              Annuler
            </Button>
            <Button
              color="amber"
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

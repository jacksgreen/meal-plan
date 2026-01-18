import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Modal, Button, Input, Textarea, Select, TagInput } from '../ui';
import type { Id } from '../../../convex/_generated/dataModel';

interface RecipeData {
  _id: Id<"recipes">;
  name: string;
  source: string;
  sourceUrl?: string;
  status: 'to-try' | 'tried';
  priority?: 'high' | 'someday';
  notes?: string;
  usedWith: string[];
  tags: string[];
}

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  recipe?: RecipeData | null;
  onDelete?: () => void;
}

export function RecipeForm({ isOpen, onClose, recipe, onDelete }: RecipeFormProps) {
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [status, setStatus] = useState<'to-try' | 'tried'>('to-try');
  const [priority, setPriority] = useState<'high' | 'someday'>('someday');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRecipe = useMutation(api.recipes.create);
  const updateStatus = useMutation(api.recipes.updateStatus);

  const isEdit = !!recipe;

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (recipe) {
        setName(recipe.name);
        setSource(recipe.source || '');
        setSourceUrl(recipe.sourceUrl || '');
        setStatus(recipe.status);
        setPriority(recipe.priority || 'someday');
        setNotes(recipe.notes || '');
        setTags(recipe.tags || []);
      } else {
        setName('');
        setSource('');
        setSourceUrl('');
        setStatus('to-try');
        setPriority('someday');
        setNotes('');
        setTags([]);
      }
      setError(null);
    }
  }, [isOpen, recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a recipe name');
      return;
    }

    if (!source.trim()) {
      setError('Please enter a source');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && recipe) {
        // For now, we can only update status (the Convex API doesn't have a full update)
        // In a real app, you'd add an update mutation
        if (recipe.status !== status) {
          await updateStatus({
            recipeId: recipe._id,
            status,
          });
        }
      } else {
        // Create new recipe
        await createRecipe({
          name: name.trim(),
          source: source.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
          status,
          priority: status === 'to-try' ? priority : undefined,
          notes: notes.trim() || undefined,
          usedWith: [],
          tags,
        });
      }

      onClose();
    } catch (err) {
      setError('Failed to save recipe. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'to-try', label: 'Want to try' },
    { value: 'tried', label: 'Already tried' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High priority' },
    { value: 'someday', label: 'Someday' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Recipe' : 'Add Recipe'}
      footer={
        <>
          {isEdit && onDelete && (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Add Recipe'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Recipe name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pasta Carbonara"
          autoFocus
          disabled={isEdit}
        />

        <Input
          label="Source"
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="NYT Cooking, Bon Appetit, etc."
          disabled={isEdit}
        />

        <Input
          label="Source URL (optional)"
          name="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          disabled={isEdit}
        />

        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'to-try' | 'tried')}
          options={statusOptions}
        />

        {status === 'to-try' && (
          <Select
            label="Priority"
            name="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'high' | 'someday')}
            options={priorityOptions}
            disabled={isEdit}
          />
        )}

        <Textarea
          label="Notes (optional)"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about this recipe..."
          rows={3}
          disabled={isEdit}
        />

        <TagInput
          label="Tags"
          value={tags}
          onChange={setTags}
          placeholder="italian, quick, vegetarian, etc."
        />
      </form>
    </Modal>
  );
}

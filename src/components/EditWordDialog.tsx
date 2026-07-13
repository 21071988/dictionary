import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import type { WordCard, WordCardInput } from '../types';
import { WordForm } from './WordForm';
import strings from '../strings.json';

interface EditWordDialogProps {
  open: boolean;
  card: WordCard | null;
  onClose: () => void;
  onSave: (input: WordCardInput) => void;
}

export function EditWordDialog({ open, card, onClose, onSave }: EditWordDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{strings.editDialog.title}</DialogTitle>
      <DialogContent>
        <WordForm key={card?.id} initial={card} submitLabel={strings.editDialog.save} onSubmit={onSave} />
      </DialogContent>
    </Dialog>
  );
}

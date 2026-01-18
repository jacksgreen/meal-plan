import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../ui';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={isDeleting}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="delete-confirm-content">
        <div className="delete-confirm-icon">
          <AlertTriangle className="w-7 h-7" />
        </div>
        {itemName && (
          <p className="delete-confirm-title">"{itemName}"</p>
        )}
        <p className="delete-confirm-message">{message}</p>
      </div>
    </Modal>
  );
}

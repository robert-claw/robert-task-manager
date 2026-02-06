'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, Button, Textarea } from '@/components/ui';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (approve: boolean, feedback: string) => void;
}

export function ReviewModal({ isOpen, onClose, onSubmit }: ReviewModalProps) {
  const t = useTranslations('tasks');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (approve: boolean) => {
    onSubmit(approve, feedback);
    setFeedback('');
  };

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('reviewTitle')}
      titleColor="text-amber-400"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            {t('cancel')}
          </Button>
          <Button 
            variant="rose" 
            onClick={() => handleSubmit(false)} 
            className="flex-1"
          >
            {t('requestChanges')}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSubmit(true)} 
            className="flex-1"
          >
            {t('approve')}
          </Button>
        </div>
      }
    >
      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={t('feedbackPlaceholder')}
        className="h-24"
      />
    </Modal>
  );
}

export default ReviewModal;

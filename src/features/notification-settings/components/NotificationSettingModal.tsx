import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { AlertSettings } from './AlertSettings';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal = ({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Tell us which notification you would like to receive!
          </DialogDescription>
        </DialogHeader>
        <div className="h-full">
          <ScrollArea className="h-full max-h-[900px] scrollbar-thin">
            <AlertSettings onSave={onClose} />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

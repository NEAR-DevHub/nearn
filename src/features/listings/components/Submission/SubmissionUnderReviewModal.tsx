import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface SubmissionUnderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionUnderReviewModal = ({
  isOpen,
  onClose,
}: SubmissionUnderReviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <DialogTitle className="text-center">
            You Have a Submission Under Review
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You'll be able to send a new one once it's either approved or rejected.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <Button 
            onClick={onClose} 
            className="w-full"
            variant="default"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
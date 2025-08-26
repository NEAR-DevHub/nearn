import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
        <DialogHeader>
          <DialogTitle>You Have a Submission Under Review</DialogTitle>
          <DialogDescription className="pt-2">
            You’ll be able to send a new one once it’s either approved or
            rejected.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

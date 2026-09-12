import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { adminInquiriesApi, type AdminCommodityRequest } from './adminInquiries.api';
import { useToast } from '../auth/ToastContext';

const editSchema = z.object({
  internalNotes: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface InquiryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AdminCommodityRequest;
  onSuccess: () => void;
}

export function InquiryEditModal({ isOpen, onClose, request, onSuccess }: InquiryEditModalProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      internalNotes: request.internalNotes || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        internalNotes: request.internalNotes || '',
      });
    }
  }, [isOpen, request, reset]);

  const onSubmit = async (data: EditFormValues) => {
    setSaving(true);
    try {
      const res = await adminInquiriesApi.update(request.id, {
        internalNotes: data.internalNotes,
      });
      if (res.success) {
        toast.success('Inquiry details updated.');
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deal Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <Textarea 
              placeholder="Private notes for staff..." 
              className="resize-none min-h-[120px]"
              {...register('internalNotes')} 
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

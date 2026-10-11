import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { adminInquiriesApi } from './adminInquiries.api';
import { useToast } from '../auth/ToastContext';

const closeSchema = z.object({
  status: z.enum(['completed', 'rejected', 'expired']),
  agreedPrice: z.coerce.number().optional(),
  closureNote: z.string().optional(),
});

type CloseFormValues = z.infer<typeof closeSchema>;

interface InquiryCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiryId: string;
  onSuccess: () => void;
}

export function InquiryCloseModal({ isOpen, onClose, inquiryId, onSuccess }: InquiryCloseModalProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CloseFormValues>({
    resolver: zodResolver(closeSchema) as any,
    defaultValues: {
      status: 'completed',
    },
  });

  const status = watch('status');

  const onSubmit = async (data: CloseFormValues) => {
    setSaving(true);
    try {
      const res = await adminInquiriesApi.closeInquiry(inquiryId, data);
      if (res.success) {
        toast.success('Inquiry closed successfully.');
        reset();
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to close inquiry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Deal</DialogTitle>
          <DialogDescription>
            Closing a deal is a terminal action. The deal will be locked for editing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Outcome Status</Label>
            <Select 
              value={status} 
              onValueChange={(val: 'completed' | 'rejected' | 'expired') => setValue('status', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed (Closed Won)</SelectItem>
                <SelectItem value="rejected">Rejected (Closed Lost)</SelectItem>
                <SelectItem value="expired">Expired (Closed Lost)</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>

          {status === 'completed' && (
            <div className="space-y-2">
              <Label>Agreed Price</Label>
              <Input type="number" step="0.0001" placeholder="Enter final agreed price" {...register('agreedPrice')} />
              {errors.agreedPrice && <p className="text-sm text-destructive">{errors.agreedPrice.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Closure Note (Internal)</Label>
            <Textarea 
              placeholder="Why was this deal closed?" 
              className="resize-none"
              {...register('closureNote')} 
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]">
              {saving ? 'Closing...' : 'Confirm Closure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

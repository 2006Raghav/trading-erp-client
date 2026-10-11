import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminInquiriesApi, type AdminCommodityRequest, type RequestStatus } from './adminInquiries.api';
import { dealDocumentsApi, type DealDocument } from './dealDocuments.api';
import { DocumentPanel } from './DocumentPanel';
import { MessagePanel } from './MessagePanel';
import { DealDetailPanel } from './DealDetailPanel';
import { Loader2, ArrowLeft, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface InquiryDetailProps {
  inquiryId: string;
  onBack?: () => void;
  onOpenAssignModal: (req: AdminCommodityRequest) => void;
}

const STATUS_BADGE: Record<RequestStatus, { label: string; bg: string; text: string; border: string }> = {
  open: { label: 'Open', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  sourcing: { label: 'Sourcing (Assigned)', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  quoted: { label: 'Quoted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  closed_won: { label: 'Closed Won', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed_lost: { label: 'Closed Lost', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export function InquiryDetail({ inquiryId, onBack, onOpenAssignModal }: InquiryDetailProps) {
  const navigate = useNavigate();
  const [request, setRequest] = useState<AdminCommodityRequest | null>(null);
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/inquiries');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, docs] = await Promise.all([
        adminInquiriesApi.getById(inquiryId),
        dealDocumentsApi.getDocuments(inquiryId).catch((err) => {
          console.warn('Failed to load deal documents:', err);
          return [] as DealDocument[];
        })
      ]);
      if (reqRes.success && reqRes.data) {
        setRequest(reqRes.data);
      } else {
        setError('Inquiry record could not be found.');
      }
      setDocuments(docs || []);
    } catch (err: any) {
      console.error('Failed to load inquiry details', err);
      setError(err?.message || 'Failed to load deal workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [inquiryId]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[var(--color-canvas-50)] min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-cobalt-600)]" />
          <p className="text-xs text-[var(--color-slate-500)] font-medium">Loading deal workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-canvas-50)] p-6 min-h-[500px]">
        <div className="max-w-md w-full bg-white border border-[var(--color-slate-200)] rounded-xl p-6 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--color-ink-900)]">
              Deal Workspace Unavailable
            </h3>
            <p className="text-xs text-[var(--color-slate-500)] leading-relaxed">
              {error || 'The requested deal or inquiry could not be loaded.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="text-xs border-[var(--color-slate-200)] text-[var(--color-slate-700)] hover:bg-[var(--color-canvas-50)]"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Inquiries
            </Button>
            <Button
              size="sm"
              onClick={loadData}
              className="text-xs bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_BADGE[request.status] || STATUS_BADGE.open;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-canvas-50)] text-[var(--color-ink-900)] font-sans">
      {/* Header Bar */}
      <div className="px-6 py-3.5 bg-white border-b border-[var(--color-slate-200)] shadow-2xs shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="h-8 px-2.5 text-xs border-[var(--color-slate-200)] text-[var(--color-slate-700)] hover:bg-[var(--color-canvas-50)]"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-base font-bold text-[var(--color-cobalt-600)]">
                  {request.referenceNumber}
                </span>
                <span className="text-[var(--color-slate-300)]">•</span>
                <h1 className="text-base font-bold text-[var(--color-ink-900)]">
                  {request.displayName}
                </h1>
                <Badge variant="outline" className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-0.5 leading-none ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-[var(--color-slate-500)] mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span>Buyer: <strong className="text-[var(--color-ink-900)] font-semibold">{request.buyerCompanyName}</strong></span>
                <span>• Qty: <strong className="text-[var(--color-ink-900)] font-mono">{request.quantity.toLocaleString()} {request.quantityUnit}</strong></span>
                {request.deliveryCountry && <span>• Destination: <strong className="text-[var(--color-ink-900)] font-semibold">{request.deliveryCountry}</strong></span>}
                {request.deliveryTerms && <span>({request.deliveryTerms})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {request.assignedSellerId ? (
              <Badge variant="secondary" className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-3 text-xs font-semibold leading-none">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Supplier: {request.sellerCompanyName}</span>
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => onOpenAssignModal(request)}
                className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white text-xs h-8 px-3 gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Connect Supplier
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3-Panel Workspace Grid */}
      <div className="flex-1 p-4 lg:p-4 max-w-[1600px] w-full mx-auto flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 lg:h-full">
          {/* Left Panel: Documents (5 cols = 40%) */}
          <div className="lg:col-span-5 flex flex-col min-h-[450px] lg:min-h-0 lg:h-full overflow-hidden">
            <DocumentPanel 
              inquiryId={inquiryId} 
              documents={documents}
              onRefresh={loadData}
            />
          </div>

          {/* Center Panel: Messaging (4 cols = 35%) */}
          <div className="lg:col-span-4 flex flex-col min-h-[450px] lg:min-h-0 lg:h-full overflow-hidden">
            <MessagePanel 
              inquiryId={inquiryId} 
              documents={documents}
            />
          </div>

          {/* Right Panel: Deal Details (3 cols = 25%) */}
          <div className="lg:col-span-3 flex flex-col min-h-[450px] lg:min-h-0 lg:h-full overflow-hidden">
            <DealDetailPanel 
              request={request}
              onRefresh={loadData}
              onOpenAssignModal={onOpenAssignModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

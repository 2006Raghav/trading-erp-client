// src/renderer/src/modules/inquiries/DocumentPanel.tsx

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  FileText,
  Download,
  Loader2,
  Filter,
  FilePlus
} from 'lucide-react';
import { dealDocumentsApi, type DealDocument } from './dealDocuments.api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

interface DocumentPanelProps {
  inquiryId: string;
  documents?: DealDocument[];
  onRefresh?: () => void;
}

const DOC_TYPES = [
  { value: 'ALL', label: 'All Document Types' },
  { value: 'SPA', label: 'Sales & Purchase Agreement (SPA)' },
  { value: 'NCNDA', label: 'NCNDA' },
  { value: 'IMFPA', label: 'IMFPA' },
  { value: 'MOU', label: 'Memorandum of Understanding' },
  { value: 'LOI', label: 'Letter of Intent (LOI)' },
  { value: 'ICPO', label: 'ICPO' },
  { value: 'BCL', label: 'Bank Comfort Letter (BCL)' },
  { value: 'PROFORMA_INVOICE', label: 'Proforma Invoice' },
  { value: 'ANALYTICAL_REPORT', label: 'Analytical Report' },
  { value: 'INSPECTION_REPORT', label: 'Inspection Report' },
  { value: 'OTHER', label: 'Other Trade Document' }
];

export function DocumentPanel({ inquiryId, documents: initialDocs, onRefresh }: DocumentPanelProps) {
  const [internalDocs, setInternalDocs] = useState<DealDocument[]>([]);
  const fetchDocs = async () => {
    try {
      const docs = await dealDocumentsApi.getDocuments(inquiryId);
      setInternalDocs(docs);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  useEffect(() => {
    if (!initialDocs) {
      fetchDocs();
    }
  }, [inquiryId, initialDocs]);

  const documents = initialDocs || internalDocs;
  const handleRefresh = onRefresh || fetchDocs;
  
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('SPA');
  const [title, setTitle] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [docToReview, setDocToReview] = useState<DealDocument | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('verified');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const handleUpload = async () => {
    if (!fileToUpload || !title) return;
    try {
      setUploading(true);
      await dealDocumentsApi.uploadDocument(inquiryId, fileToUpload, {
        documentType: selectedDocType,
        title,
        visibleToBuyer: false,
        visibleToSeller: false,
        visibleToBuyerMandate: false,
        visibleToSellerMandate: false,
      });
      setFileToUpload(null);
      setTitle('');
      setShowUploadForm(false);
      handleRefresh();
    } catch (err) {
      console.error('Failed to upload', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const { signedUrl } = await dealDocumentsApi.getDownloadUrl(inquiryId, docId);
      window.open(signedUrl, '_blank');
    } catch (err) {
      console.error('Failed to get download url', err);
    }
  };

  const toggleVisibility = async (doc: DealDocument, role: 'Buyer' | 'Seller' | 'BuyerMandate' | 'SellerMandate') => {
    try {
      const updates = {
        visibleToBuyer: role === 'Buyer' ? !doc.visibleToBuyer : undefined,
        visibleToSeller: role === 'Seller' ? !doc.visibleToSeller : undefined,
        visibleToBuyerMandate: role === 'BuyerMandate' ? !doc.visibleToBuyerMandate : undefined,
        visibleToSellerMandate: role === 'SellerMandate' ? !doc.visibleToSellerMandate : undefined,
      };
      await dealDocumentsApi.updateVisibility(inquiryId, doc.id, updates);
      handleRefresh();
    } catch (err) {
      console.error('Failed to toggle visibility', err);
    }
  };

  const handleReviewSubmit = async () => {
    if (!docToReview) return;
    try {
      setReviewing(true);
      await dealDocumentsApi.updateReviewStatus(
        inquiryId,
        docToReview.id,
        reviewStatus,
        reviewNote
      );
      setReviewModalOpen(false);
      handleRefresh();
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setReviewing(false);
    }
  };

  const openReviewModal = (doc: DealDocument) => {
    setDocToReview(doc);
    setReviewStatus(doc.reviewStatus === 'received' ? 'verified' : doc.reviewStatus);
    setReviewNote(doc.reviewNote || '');
    setReviewModalOpen(true);
  };

  const renderVisibilityBadge = (doc: DealDocument, label: string, role: 'Buyer' | 'Seller' | 'BuyerMandate' | 'SellerMandate', isVisible: boolean) => (
    <button
      type="button"
      onClick={() => toggleVisibility(doc, role)}
      className={`inline-flex items-center justify-center min-w-[24px] h-[18px] px-1.5 rounded text-[10px] font-mono font-bold leading-none text-center transition-all border ${
        isVisible 
          ? 'bg-[var(--color-cobalt-600)] text-white border-[var(--color-cobalt-600)] shadow-2xs' 
          : 'bg-[var(--color-canvas-100)] text-[var(--color-slate-400)] border-[var(--color-slate-200)] hover:text-[var(--color-slate-700)]'
      }`}
      title={`Click to toggle ${label} visibility`}
    >
      {label}
    </button>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold px-2 py-0.5 inline-flex items-center justify-center leading-none">
            Verified ✓
          </Badge>
        );
      case 'revision_requested':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-semibold px-2 py-0.5 inline-flex items-center justify-center leading-none">
            ⚠ Revision Needed
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold px-2 py-0.5 inline-flex items-center justify-center leading-none">
            Under Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold px-2 py-0.5 inline-flex items-center justify-center leading-none">
            Received
          </Badge>
        );
    }
  };

  // Filter latest versions
  let latestDocs = documents.filter(d => d.isLatestVersion);
  if (typeFilter !== 'ALL') {
    latestDocs = latestDocs.filter(d => d.documentType === typeFilter);
  }

  return (
    <div className="flex flex-col h-full bg-white border border-[var(--color-slate-200)] rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[var(--color-canvas-50)] border-b border-[var(--color-slate-200)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--color-cobalt-600)]" />
          <h2 className="text-sm font-bold text-[var(--color-ink-900)]">
            Deal Documents ({latestDocs.length})
          </h2>
        </div>
        
        <Button
          size="sm"
          variant={showUploadForm ? "secondary" : "default"}
          onClick={() => setShowUploadForm(!showUploadForm)}
          className={`h-7 text-xs px-2.5 gap-1 ${
            showUploadForm
              ? 'bg-[var(--color-canvas-200)] text-[var(--color-ink-900)]'
              : 'bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white'
          }`}
        >
          <FilePlus className="h-3.5 w-3.5" />
          {showUploadForm ? 'Cancel' : 'Upload'}
        </Button>
      </div>

      {/* Upload Form Accordion */}
      {showUploadForm && (
        <div className="p-4 bg-[var(--color-canvas-50)]/70 border-b border-[var(--color-slate-200)] space-y-3 shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate-500)]">
            New Document Upload
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Document Title (e.g. Draft SPA v1)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-xs border-[var(--color-slate-200)] bg-white"
            />
            
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger className="h-8 text-xs bg-white border-[var(--color-slate-200)]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.filter(t => t.value !== 'ALL').map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                className="text-xs flex-1 text-[var(--color-slate-600)] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-cobalt-50)] file:text-[var(--color-cobalt-600)]"
              />
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploading || !fileToUpload || !title}
                className="h-8 text-xs bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white px-3"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Type Filter Dropdown Bar */}
      <div className="px-4 py-2 bg-white border-b border-[var(--color-slate-100)] flex items-center justify-between shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-slate-400)] flex items-center gap-1">
          <Filter className="h-3 w-3" /> Type Filter:
        </span>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-7 text-[11px] w-36 border-none bg-[var(--color-canvas-50)] px-2">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value} className="text-xs">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scrollable Document List */}
      <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2.5">
        {latestDocs.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-slate-500)] space-y-1">
            <FileText className="h-8 w-8 mx-auto text-[var(--color-slate-300)]" />
            <p className="text-xs font-semibold text-[var(--color-ink-900)]">No trade documents found</p>
            <p className="text-[11px] text-[var(--color-slate-400)]">
              {typeFilter !== 'ALL' ? 'No documents match the selected type filter.' : 'Upload SPA, ICPO, or BCL documents to begin.'}
            </p>
          </div>
        ) : (
          latestDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl border border-[var(--color-slate-200)] bg-white hover:border-[var(--color-cobalt-300)] transition-all shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-[var(--color-cobalt-50)] text-[var(--color-cobalt-700)] border border-[var(--color-cobalt-200)] rounded text-[10px] font-mono uppercase font-bold leading-none">
                      {doc.documentType}
                    </span>
                    <span className="inline-flex items-center justify-center text-[10px] font-mono text-[var(--color-slate-400)] leading-none">v{doc.version}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--color-ink-900)] mt-1 truncate">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-[var(--color-slate-500)] mt-0.5 truncate">
                    By <span className="font-medium text-[var(--color-slate-700)]">{doc.uploadedByName}</span> • {(doc.fileSizeBytes / 1024).toFixed(0)} KB
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openReviewModal(doc)}
                    className="hover:opacity-80 transition-opacity"
                    title="Click to review status"
                  >
                    {getStatusBadge(doc.reviewStatus)}
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-[var(--color-slate-500)] hover:text-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-50)]"
                    onClick={() => handleDownload(doc.id)}
                    title="Download File"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Visibility Controls Footer */}
              <div className="flex items-center justify-between border-t border-[var(--color-slate-100)] pt-2 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-[var(--color-slate-400)] uppercase mr-1">Sharing:</span>
                  {renderVisibilityBadge(doc, 'B', 'Buyer', doc.visibleToBuyer)}
                  {renderVisibilityBadge(doc, 'S', 'Seller', doc.visibleToSeller)}
                  {renderVisibilityBadge(doc, 'BM', 'BuyerMandate', doc.visibleToBuyerMandate)}
                  {renderVisibilityBadge(doc, 'SM', 'SellerMandate', doc.visibleToSellerMandate)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Internal Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-md border-[var(--color-slate-200)] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[var(--color-ink-900)]">
              Document Review & Status
            </DialogTitle>
          </DialogHeader>
          {docToReview && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-[var(--color-canvas-50)] border border-[var(--color-slate-200)] rounded-lg">
                <p className="text-xs font-bold text-[var(--color-ink-900)]">{docToReview.title}</p>
                <p className="text-[11px] text-[var(--color-slate-500)] mt-0.5">
                  Type: <span className="font-mono font-semibold">{docToReview.documentType}</span> • Version: v{docToReview.version}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-ink-900)]">Review Decision</label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_review" className="text-xs">Under Review</SelectItem>
                    <SelectItem value="verified" className="text-xs">Verified (Approved)</SelectItem>
                    <SelectItem value="revision_requested" className="text-xs">Revision Requested (Needs Changes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-ink-900)]">Review / Revision Guidance Note</label>
                <Textarea
                  className="text-xs resize-none h-20"
                  placeholder="State review findings or re-upload requirements..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-slate-100)]">
                <Button variant="ghost" size="sm" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReviewSubmit}
                  disabled={reviewing}
                  className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white text-xs"
                >
                  {reviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Save Review Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Loader2,
  FileText,
  ShieldCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { dealMessagesApi, type DealMessage, type DealMessageThread } from './dealMessages.api';
import { dealDocumentsApi, type DealDocument } from './dealDocuments.api';
import { useToast } from '../auth/ToastContext';
import { useDealMessages } from '../exchange/deals/useDealMessages';
import { triggerNotificationRefresh } from '../../lib/notifications';

interface MessagePanelProps {
  inquiryId: string;
  documents: DealDocument[];
}

const THREADS: { id: DealMessageThread; label: string }[] = [
  { id: 'internal', label: 'Internal' },
  { id: 'buyer', label: 'Buyer' },
  { id: 'seller', label: 'Seller' },
  { id: 'buyer_mandate', label: 'Buyer Mandate' },
  { id: 'seller_mandate', label: 'Seller Mandate' }
];

export function MessagePanel({ inquiryId, documents }: MessagePanelProps) {
  const [activeThread, setActiveThread] = useState<DealMessageThread>('internal');
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<DealMessageThread, number>>({
    buyer: 0,
    seller: 0,
    buyer_mandate: 0,
    seller_mandate: 0,
    internal: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  const [content, setContent] = useState('');
  const [attachedDocumentId, setAttachedDocumentId] = useState<string>('none');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  // Track the latest message IDs to avoid re-adding duplicates during polling
  const latestMessageIdsRef = useRef<Set<string>>(new Set());
  const activeThreadRef = useRef(activeThread);
  const inquiryIdRef = useRef(inquiryId);
  const messageRequestIdRef = useRef(0);
  activeThreadRef.current = activeThread;
  inquiryIdRef.current = inquiryId;

  const loadUnreadCounts = async () => {
    try {
      const res = await dealMessagesApi.getUnreadCounts(inquiryId);
      if (res.success) setUnreadCounts(res.data);
    } catch (err) {
      console.error('Failed to load unread counts', err);
    }
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    const requestId = ++messageRequestIdRef.current;
    try {
      const thread = activeThreadRef.current;
      const res = await dealMessagesApi.getMessages(inquiryId, thread);
      // A response for an earlier thread/deal must not replace the view after
      // the user has navigated or changed tabs.
      if (
        res.success &&
        requestId === messageRequestIdRef.current &&
        inquiryIdRef.current === inquiryId &&
        activeThreadRef.current === thread
      ) {
        const newIds = new Set(res.data.map((m: DealMessage) => m.id));
        const hasNewMessages = res.data.some((m: DealMessage) => !latestMessageIdsRef.current.has(m.id));
        latestMessageIdsRef.current = newIds;
        setMessages(res.data);
        
        // Silent polling should not repeatedly write/read-refresh when the
        // server returned the exact same message set.
        if (!silent || hasNewMessages) {
          await dealMessagesApi.markAsRead(inquiryId, thread).catch(() => {});
          setUnreadCounts(prev => ({ ...prev, [thread]: 0 }));
          triggerNotificationRefresh();
        }
      }
    } catch (err) {
      if (!silent) toast.error('Failed to load messages');
    } finally {
      if (!silent) setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, [inquiryId]);

  useEffect(() => {
    latestMessageIdsRef.current = new Set();
    loadMessages();
  }, [inquiryId, activeThread]);

  // ── Polling fallback ──────────────────────────────────────────────────────
  // Poll every 8 s only while WebSocket delivery is unavailable.
  useEffect(() => {
    if (wsConnected) return;
    const id = setInterval(() => {
      loadMessages(true /* silent */);
    }, 8000);
    return () => clearInterval(id);
  }, [inquiryId, activeThread, wsConnected]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Real-time deal messages subscription via WebSocket
  useDealMessages({
    inquiryId,
    onNewMessage: (msg: any, msgThread?: string) => {
      const incomingThread = (msgThread || msg.thread) as DealMessageThread;

      const senderType = msg.senderType || msg.sender_type || '';
      if (incomingThread === activeThreadRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const newMsg: DealMessage = {
            id: msg.id,
            inquiry_id: inquiryId,
            thread: incomingThread,
            sender_type: senderType,
            sender_id: msg.senderId || msg.sender_id || '',
            sender_name: msg.senderName || msg.sender_name || (senderType === 'internal' ? 'Platform' : 'User'),
            content: msg.content,
            referenced_document_id: msg.referencedDocumentId || msg.referenced_document_id || null,
            document_title: msg.documentTitle || msg.document_title,
            document_file_name: msg.documentFileName || msg.document_file_name,
            read_at: msg.readAt || msg.read_at || null,
            created_at: msg.createdAt || msg.created_at || new Date().toISOString(),
          };
          latestMessageIdsRef.current.add(msg.id);
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 100);

        // Mark as read and clear notifications if sent by external party
        if (senderType !== 'internal') {
          dealMessagesApi.markAsRead(inquiryId, activeThreadRef.current).then(() => {
            triggerNotificationRefresh();
          }).catch(() => {});
        }
      } else if (incomingThread && incomingThread in unreadCounts) {
        // Increment unread badge for the corresponding thread
        setUnreadCounts((prev) => ({
          ...prev,
          [incomingThread]: (prev[incomingThread] || 0) + 1,
        }));
      }
    },
    onConnected: () => setWsConnected(true),
    onDisconnected: () => setWsConnected(false),
  });

  const handleSend = async () => {
    if (!content.trim()) return;
    const trimmed = content.trim();
    const docId = attachedDocumentId !== 'none' ? attachedDocumentId : undefined;
    const selectedDoc = documents.find((d) => d.id === docId);

    setSending(true);
    try {
      const payload = {
        thread: activeThread,
        content: trimmed,
        referencedDocumentId: docId,
      };
      const res = await dealMessagesApi.sendMessage(inquiryId, payload);
      if (res.success) {
        setContent('');
        setAttachedDocumentId('none');
        const msgId = (res as any).data?.messageId || (res as any).messageId;
        if (msgId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msgId)) return prev;
            return [
              ...prev,
              {
                id: msgId,
                inquiry_id: inquiryId,
                thread: activeThread,
                sender_type: 'internal',
                sender_id: '',
                sender_name: 'Platform',
                content: trimmed,
                referenced_document_id: docId || null,
                document_title: selectedDoc?.title,
                document_file_name: selectedDoc?.fileName,
                read_at: null,
                created_at: new Date().toISOString(),
              },
            ];
          });
          setTimeout(scrollToBottom, 100);
        } else {
          loadMessages();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const { signedUrl } = await dealDocumentsApi.getDownloadUrl(inquiryId, docId);
      window.open(signedUrl, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Failed to open document');
    }
  };

  // Filter documents that are visible to the current thread
  const visibleDocuments = documents.filter(doc => {
    if (activeThread === 'internal') return true;
    if (activeThread === 'buyer' && doc.visibleToBuyer) return true;
    if (activeThread === 'seller' && doc.visibleToSeller) return true;
    if (activeThread === 'buyer_mandate' && doc.visibleToBuyerMandate) return true;
    if (activeThread === 'seller_mandate' && doc.visibleToSellerMandate) return true;
    return false;
  });

  return (
    <div className="flex flex-col h-full bg-white border border-[var(--color-slate-200)] rounded-xl shadow-xs overflow-hidden">
      {/* Header & Thread Tabs */}
      <div className="p-3.5 border-b border-[var(--color-slate-200)] bg-[var(--color-canvas-50)] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[var(--color-cobalt-600)]" />
            <h2 className="text-sm font-bold text-[var(--color-ink-900)]">
              Deal Communication Channels
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {/* WebSocket connection status */}
            <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border leading-none ${
              wsConnected
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}>
              {wsConnected
                ? <><Wifi className="w-3 h-3" /><span>Live</span></>
                : <><WifiOff className="w-3 h-3" /><span>Polling</span></>}
            </div>
            <div className="inline-flex items-center justify-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 leading-none">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Secure Channel</span>
            </div>
          </div>
        </div>
        
        <Tabs value={activeThread} onValueChange={(v) => setActiveThread(v as DealMessageThread)}>
          <TabsList className="bg-[var(--color-canvas-100)] w-full flex overflow-x-auto justify-start h-auto p-1 gap-1">
            {THREADS.map(t => (
              <TabsTrigger 
                key={t.id} 
                value={t.id}
                className="flex-shrink-0 text-xs py-1 px-2.5 font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:text-[var(--color-cobalt-600)] data-[state=active]:shadow-2xs"
              >
                {t.label}
                {unreadCounts[t.id] > 0 && (
                  <Badge className="ml-1.5 h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold bg-rose-500 text-white inline-flex items-center justify-center leading-none border-none p-0">
                    {unreadCounts[t.id]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3.5 bg-[var(--color-canvas-50)]/40" ref={scrollRef}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-slate-400)] gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-cobalt-600)]" />
            <span className="text-xs">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-slate-500)] text-center py-10">
            <MessageSquare className="h-10 w-10 text-[var(--color-slate-300)] mb-2" />
            <p className="text-xs font-semibold text-[var(--color-ink-900)]">No messages in this channel</p>
            <p className="text-[11px] text-[var(--color-slate-400)] mt-0.5 max-w-[220px]">
              Direct channel with <span className="font-semibold text-[var(--color-slate-700)]">{THREADS.find(t => t.id === activeThread)?.label}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const isInternal = msg.sender_type === 'internal';
              return (
                <div key={msg.id} className={`flex flex-col ${isInternal ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-[var(--color-slate-600)]">
                      {msg.sender_name}
                    </span>
                    <span className="text-[9px] text-[var(--color-slate-400)] font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div 
                    className={`max-w-[85%] min-w-0 rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs break-words [overflow-wrap:anywhere] ${
                      isInternal 
                        ? 'bg-[var(--color-cobalt-600)] text-white rounded-tr-xs' 
                        : 'bg-white border border-[var(--color-slate-200)] text-[var(--color-ink-900)] rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.content}</p>
                    
                    {msg.referenced_document_id && (
                      <button
                        type="button"
                        onClick={() => handleDownload(msg.referenced_document_id!)}
                        title="Open referenced document"
                        className={`mt-2 w-full flex items-center gap-2 p-2 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                        isInternal 
                          ? 'bg-[var(--color-cobalt-700)] text-white border border-[var(--color-cobalt-500)] hover:bg-[var(--color-cobalt-800)]' 
                          : 'bg-[var(--color-canvas-50)] text-[var(--color-cobalt-600)] border border-[var(--color-slate-200)] hover:bg-[var(--color-cobalt-50)]'
                      }`}>
                        <FileText className="h-3.5 w-3.5 shrink-0 opacity-80" />
                        <span className="text-xs font-semibold truncate flex-1">
                          {msg.document_title || 'Attached Document'}
                        </span>
                      </button>
                    )}
                  </div>
                  
                  {isInternal && (
                    <div className="mt-1 px-1 flex items-center gap-1">
                      {msg.read_at ? (
                        <CheckCheck className="h-3 w-3 text-[var(--color-cobalt-600)]" />
                      ) : (
                        <Check className="h-3 w-3 text-[var(--color-slate-300)]" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-[var(--color-slate-200)] bg-white space-y-2 shrink-0">
        {visibleDocuments.length > 0 && (
          <div className="flex items-center gap-2">
            <Paperclip className="h-3.5 w-3.5 text-[var(--color-slate-400)] shrink-0" />
            <Select value={attachedDocumentId} onValueChange={setAttachedDocumentId}>
              <SelectTrigger className="h-7 text-[11px] bg-[var(--color-canvas-50)] border-[var(--color-slate-200)]">
                <SelectValue placeholder="Reference document (optional)..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">No attachment</SelectItem>
                {visibleDocuments.map(doc => (
                  <SelectItem key={doc.id} value={doc.id} className="text-xs">
                    {doc.title} (v{doc.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`Send message to ${THREADS.find(t => t.id === activeThread)?.label}...`}
            className="min-h-[44px] max-h-[100px] resize-none text-xs border-[var(--color-slate-200)] focus-visible:ring-[var(--color-cobalt-600)]"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend} 
            disabled={!content.trim() || sending}
            className="h-9 w-9 p-0 rounded-xl bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white shrink-0 shadow-2xs"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

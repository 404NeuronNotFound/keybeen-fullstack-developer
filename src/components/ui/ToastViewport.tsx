import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, CircleAlert, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import type { ToastMessage } from '../../store/toastStore';

const ICONS = { success: Check, error: CircleAlert, info: Info };

function ToastCard({ message }: { message: ToastMessage }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const Icon = ICONS[message.variant];

  useEffect(() => {
    if (message.duration <= 0 || hovered || focused) return;
    const timer = window.setTimeout(() => dismiss(message.id), message.duration);
    return () => window.clearTimeout(timer);
  }, [message.id, message.duration, dismiss, hovered, focused]);

  return (
    <div
      className={`toast-card toast-card--${message.variant}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          dismiss(message.id);
        }
      }}
    >
      <span className="toast-icon" aria-hidden="true"><Icon size={20} strokeWidth={2.5} /></span>
      <div className="toast-copy">
        <p className="toast-title">{message.title}</p>
        {message.description && <p className="toast-description">{message.description}</p>}
      </div>
      <button type="button" className="toast-close" aria-label={`Dismiss: ${message.title}`} onClick={() => dismiss(message.id)}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const messages = useToastStore((state) => state.messages);

  return createPortal(
    <div className="toast-viewport">
      <div className="toast-stack" role="status" aria-live="polite" aria-relevant="additions" aria-atomic="false">
        {messages.filter((message) => message.variant !== 'error').map((message) => <ToastCard key={message.id} message={message} />)}
      </div>
      <div className="toast-stack" role="alert" aria-live="assertive" aria-relevant="additions" aria-atomic="false">
        {messages.filter((message) => message.variant === 'error').map((message) => <ToastCard key={message.id} message={message} />)}
      </div>
    </div>,
    document.body,
  );
}

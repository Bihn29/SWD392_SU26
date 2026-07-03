import { useEffect, useRef } from 'react';

/**
 * Reusable confirmation modal.
 * Props: isOpen, title, message, onConfirm, onCancel, confirmText, confirmVariant, loading
 */
const ConfirmModal = ({
  isOpen,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc chắn muốn tiếp tục không?',
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  confirmVariant = 'danger',
  loading = false,
}) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const iconMap = {
    danger: '🗑️',
    warning: '⚠️',
    primary: '❓',
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal">
        <div className={`modal-icon modal-icon-${confirmVariant}`}>
          {iconMap[confirmVariant] || '❓'}
        </div>
        <h2 className="modal-title" id="confirm-modal-title">{title}</h2>
        <p className="modal-body">{message}</p>
        <div className="modal-actions">
          <button
            ref={cancelRef}
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            id="confirm-modal-cancel-btn"
          >
            Hủy
          </button>
          <button
            className={`btn btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
            id="confirm-modal-confirm-btn"
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

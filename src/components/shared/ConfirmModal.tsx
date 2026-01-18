import { m } from 'motion/react';
import { useMotionPreference, backdropVariants, modalVariants } from '../../motion';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: 'danger' | 'primary';
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmVariant = 'danger',
}: ConfirmModalProps) {
  const { getVariants } = useMotionPreference();
  const confirmBgClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-primary hover:bg-primary-dark';

  return (
    <m.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      variants={getVariants(backdropVariants)}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onCancel}
    >
      <m.div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full"
        variants={getVariants(modalVariants)}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4 text-center">{title}</h3>
        <p className="text-gray-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <m.button
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-surface-light hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors"
          >
            {cancelLabel}
          </m.button>
          <m.button
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 ${confirmBgClass} text-white py-3 rounded-xl font-bold transition-colors`}
          >
            {confirmLabel}
          </m.button>
        </div>
      </m.div>
    </m.div>
  );
}

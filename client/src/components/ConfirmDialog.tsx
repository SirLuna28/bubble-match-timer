import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border-2 border-neon-cyan rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
        {/* Title */}
        <h2 className="text-xl font-bold text-neon-cyan mb-4">{title}</h2>

        {/* Message */}
        <p className="text-foreground mb-6 text-sm leading-relaxed">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`font-bold ${
              isDangerous
                ? 'bg-neon-red hover:bg-neon-red/80 text-white'
                : 'bg-neon-cyan hover:bg-neon-cyan/80 text-black'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

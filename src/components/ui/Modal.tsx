import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sheet — uses dvh so the iPhone keyboard doesn't break the layout */}
            <div
                className="relative w-full md:max-w-lg bg-card md:bg-background rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 md:duration-200 md:zoom-in-95 border-t border-white/10 md:border"
                style={{
                    maxHeight: 'calc(90dvh - env(safe-area-inset-top, 0px))',
                }}
            >
                {/* Drag handle */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content — scrollable, with safe area bottom padding */}
                <div
                    className="flex-1 overflow-y-auto p-6"
                    style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

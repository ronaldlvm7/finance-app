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
            // Clean up potentially sticky styles
            setTimeout(() => { document.body.style.overflow = 'unset'; }, 500);
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

            {/* Modal/Drawer Content */}
            <div className="relative w-full h-[85vh] md:h-auto md:max-w-lg bg-card md:bg-background rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 md:duration-200 md:zoom-in-95 border-t border-white/10 md:border">

                {/* Mobile Drag Handle Visual */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                </div>

                <div className="flex items-center justify-between p-6 border-b border-white/5 md:border-white/10">
                    <h2 className="text-2xl md:text-xl font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="h-6 w-6 text-muted-foreground" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:custom-scrollbar pb-20 md:pb-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

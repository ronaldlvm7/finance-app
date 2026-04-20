import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    hideHeader?: boolean;
    noPadding?: boolean;
}

export const Modal = ({ isOpen, onClose, title, children, hideHeader = false, noPadding = false }: ModalProps) => {
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
                className="fixed inset-0 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className="relative w-full md:max-w-lg bg-card md:bg-card rounded-t-3xl md:rounded-3xl flex flex-col animate-in slide-in-from-bottom duration-300 md:duration-200 md:zoom-in-95 border-t border-border md:border"
                style={{
                    maxHeight: 'calc(90dvh - env(safe-area-inset-top, 0px))',
                    boxShadow: '0 -4px 40px rgba(0,0,0,0.12)',
                }}
            >
                {/* Drag handle */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
                    <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                {/* Header */}
                {!hideHeader && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                        <h2 className="text-[18px] font-bold tracking-tight text-foreground">{title}</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-xl transition-colors">
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div
                    className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-6'}`}
                    style={noPadding ? undefined : { paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

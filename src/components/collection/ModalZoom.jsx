import React from 'react';
import { X } from 'lucide-react';

const ModalZoom = ({ imagen, onClose }) => {
    if (!imagen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2"
                >
                    <X size={24} />
                </button>
                <img
                    src={imagen}
                    alt="Zoom"
                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export default ModalZoom;

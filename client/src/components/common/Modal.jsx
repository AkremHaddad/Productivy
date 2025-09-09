import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose} // close when clicking overlay
    >
      <div
        className="bg-background-light dark:bg-black
                   border-2 border-accent-dark dark:border-accent
                   p-6 rounded-xl shadow-2xl flex flex-col gap-5 w-full max-w-md relative mx-4"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Title */}
        {title && (
          <h2 className="text-2xl font-jaro text-center text-secondary-dark dark:text-accent">
            {title}
          </h2>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default Modal;

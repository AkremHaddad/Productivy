import React, { useState } from "react";
import ReactDOM from "react-dom";
import { TrashIcon, PencilSquareIcon, CheckIcon } from "@heroicons/react/24/outline";

const ModalPortal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} // close only if the drag/click started on the overlay itself
    >
      <div
        className="bg-background-light dark:bg-background-dark rounded-lg p-6 relative max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {children}
      </div>
    </div>,
    document.body
  );
};


const Card = ({
  card,
  editingCard,
  editCardData,
  setEditingCard,
  setEditCardData,
  handleEditCard,
  handleDeleteCard,
  handleToggleCard,
  columnTitle,
  columnColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <>
      {/* Card preview */}
      <div className="group/card relative bg-header-light dark:bg-header-dark border-[1px] border-border-light dark:border-border-dark p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCard(card._id);
              setEditCardData({ title: card.title, description: card.description || "" });
              setIsOpen(true);
            }}
            className="p-1 rounded-full text-secondary-light dark:text-secondary-dark hover:bg-black/10 dark:hover:bg-white/10 transition"
            title="Edit"
          >
            <PencilSquareIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(true); }}
            className="p-1 rounded-full text-secondary-light dark:text-secondary-dark hover:text-red-500 dark:hover:text-red-400 hover:bg-black/10 dark:hover:bg-white/10 transition"
            title="Delete"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div onClick={() => setIsOpen(true)} className="pr-11">
          <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: columnColor?.fill }} />
            <span className="flex-1 min-w-0 text-[10px] font-semibold uppercase tracking-wide text-secondary-light dark:text-secondary-dark truncate">{columnTitle}</span>
          </div>
          <div className="flex items-start gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleCard(card._id); }}
              title={card.completed ? "Mark incomplete" : "Mark complete"}
              className={`flex-none w-4 h-4 mt-0.5 rounded-full border-[1.5px] flex items-center justify-center transition ${
                card.completed
                  ? "bg-accent-light dark:bg-accent border-accent-light dark:border-accent"
                  : "border-border-light dark:border-border-dark hover:border-accent-light dark:hover:border-accent"
              }`}
            >
              {card.completed && <CheckIcon className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
            </button>
            <h4 className={`text-sm flex-1 truncate ${card.completed ? "line-through text-secondary-light dark:text-secondary-dark" : "text-text-light dark:text-text-dark"}`}>
              {card.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Modal via Portal */}
      <ModalPortal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex flex-col gap-4 relative">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-black dark:text-white">Card Details</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleCard(card._id)}
                className={`p-2 rounded-full transition ${
                  card.completed
                    ? "bg-accent-light dark:bg-accent text-white dark:text-black"
                    : "text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                }`}
                title={card.completed ? "Mark incomplete" : "Mark complete"}
              >
                <CheckIcon className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => {
                  setEditingCard(card._id);
                  setEditCardData({ title: card.title, description: card.description || "" });
                }}
                className="p-2 rounded-full text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition"
                title="Edit"
              >
                <PencilSquareIcon className="w-5 h-5 text-text-light dark:text-text-dark" />
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="p-2 rounded-full text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition hover:text-red-500 dark:hover:text-red-400"
                title="Delete"
              >
                <TrashIcon className="w-5 h-5 text-inherit" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-text-light dark:text-text-dark font-medium">Title</label>
            {editingCard === card._id ? (
              <textarea
                value={editCardData.title}
                onChange={(e) => setEditCardData(prev => ({ ...prev, title: e.target.value }))}
                rows={2}
                maxLength={150}
                className="w-full px-4 py-2 rounded-lg border-[1px] border-border-light dark:border-border-dark bg-black/20 dark:bg-white/20 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:border-black focus:ring-black dark:focus:ring-white"
                autoFocus
              />
            ) : (
              <p className="px-4 py-2 rounded-lg  dark:bg-white/10 border-navbar-light border-2 dark:bg-navbar-dark text-text-light dark:text-text-dark">
                {card.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-text-light dark:text-text-dark font-medium">Description</label>
            {editingCard === card._id ? (
              <textarea
                value={editCardData.description}
                onChange={(e) => setEditCardData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-2 rounded-lg border-[1px] border-border-light dark:border-border-dark bg-black/20 dark:bg-white/20 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:border-black focus:ring-black dark:focus:ring-white resize-y"
              />
            ) : (
              <p className="px-4 py-2 rounded-lg dark:bg-white/10 border-navbar-light border-2 dark:bg-navbar-dark text-text-light dark:text-text-dark min-h-[120px] whitespace-pre-line">
                {card.description || "No description added."}
              </p>
            )}
          </div>

          {/* Save/Cancel buttons */}
          {editingCard === card._id && (
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setEditingCard(null)}
                className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80  border-[1px] border-border-light dark:border-border-dark
                          text-black dark:text-white hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                          transition-all duration-200 font-medium 
                          hover:border-black dark:hover:border-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditCard(card._id)}
                className="px-5 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black
                      font-bold shadow-md hover:shadow-lg transition-all duration-200
                      hover:scale-[1.02]"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Delete Confirmation */}
          {deleteConfirm && ReactDOM.createPortal(
            <div 
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-60"
              onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(false); }}
            >
              <div 
                className="bg-background-light dark:bg-background-dark  p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fadeScale"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-2 text-red-600 dark:text-red-500 text-center">Delete Card</h3>
                <p className="mb-6 opacity-80 dark:text-text-dark">
                  Are you sure you want to delete this card? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80  border-[1px] border-border-light dark:border-border-dark
                              text-black dark:text-white hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                              transition-all duration-200 font-medium 
                              hover:border-black dark:hover:border-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteCard(card._id);
                      setDeleteConfirm(false);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        </div>
      </ModalPortal>
    </>
  );
};

export default Card;
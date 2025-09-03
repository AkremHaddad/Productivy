import React, { useState } from "react";
import Modal from "../common/Modal";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

const Card = ({
  card,
  editingCard,
  editCardData,
  setEditingCard,
  setEditCardData,
  handleEditCard,
  handleDeleteCard
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <>
      {/* Card preview */}
      <div
        className=" bg-gray-200 dark:bg-navbar-dark p-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{card.title}</h4>
      </div>

      {/* Main modal */}
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="">
        <div className="flex flex-col gap-4 relative">

          {/* Header: Title + Actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-jaro text-secondary-dark dark:text-accent">Card Details</h2>
            <div className="flex gap-2">
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
                className="w-full px-4 py-2 rounded-lg border-2 border-navbar-light dark:border-navbar-dark bg-white dark:bg-navbar-dark text-text-light dark:text-text-dark focus:outline-none dark:focus:ring-2 dark:focus:ring-accent resize-y"
                autoFocus
              />
            ) : (
              <p className="px-4 py-2 rounded-lg bg-white border-navbar-light border-2 dark:bg-navbar-dark text-text-light dark:text-text-dark">
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
                className="w-full px-4 py-2 rounded-lg border-2 border-navbar-light dark:border-navbar-dark bg-white dark:bg-navbar-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent resize-y"
              />
            ) : (
              <p className="px-4 py-2 rounded-lg bg-white border-navbar-light border-2 dark:bg-navbar-dark text-text-light dark:text-text-dark min-h-[120px] whitespace-pre-line">
                {card.description || "No description added."}
              </p>
            )}
          </div>

          {/* Save/Cancel buttons */}
          {editingCard === card._id && (
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setEditingCard(null)}
                className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80 
                        text-text-light dark:text-text-dark hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                        transition-all duration-200 font-medium border border-transparent 
                        hover:border-secondary-light/30 dark:hover:border-accent/30"
                >
                Cancel
              </button>
              <button
                onClick={() => handleEditCard(card._id)}
                className="px-5 py-2 rounded-lg bg-secondary-light dark:bg-accent text-white dark:text-black
                      font-bold shadow-md hover:shadow-lg transition-all duration-200
                      hover:scale-[1.02]"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Animated floating Delete confirmation */}
          {deleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-background-light dark:bg-background-dark border-2 border-red-600 dark:border-red-500 p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fadeScale">
                <h3 className="text-lg font-bold mb-2 text-red-600 dark:text-red-500">Delete Card</h3>
                <p className="mb-6 opacity-80">
                  Are you sure you want to delete this card? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80 
                        text-text-light dark:text-text-dark hover:bg-navbar-light/50 dark:hover:bg-navbar-dark
                        transition-all duration-200 font-medium border border-transparent 
                        hover:border-secondary-light/30 dark:hover:border-accent/30"
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
            </div>
          )}


        </div>
      </Modal>
    </>
  );
};

export default Card;

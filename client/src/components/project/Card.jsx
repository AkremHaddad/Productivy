import React, { useState } from "react";
import Modal from "../common/Modal";

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
      <div
        className="bg-gray-200 dark:bg-navbar-dark p-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{card.title}</h4>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={card.title}>
        {editingCard === card._id ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editCardData.title}
              onChange={(e) => setEditCardData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-2 py-1 border-b-2 border-blue-400 focus:outline-none focus:border-blue-500 bg-transparent text-gray-900 dark:text-gray-100 font-medium"
              placeholder="Card title"
              autoFocus
            />
            <textarea
              value={editCardData.description}
              onChange={(e) => setEditCardData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
              rows="3"
              className="w-full px-2 py-1 border-b-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 bg-transparent text-gray-600 dark:text-gray-400 resize-none text-sm"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setEditingCard(null);
                  setEditCardData({ title: "", description: "" });
                }}
                className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditCard(card._id)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              {card.description || <span className="italic text-gray-500 dark:text-gray-400">No description provided.</span>}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingCard(card._id);
                  setEditCardData({ title: card.title, description: card.description || "" });
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="mt-4">
            <p className="text-center mb-2 text-red-600">Are you sure you want to delete this card? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteCard(card._id);
                  setDeleteConfirm(false);
                  setIsOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Card;

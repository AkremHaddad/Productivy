import React, { useState } from "react";
import API from "../../api/API";
import Card from "./Card";
import Modal from "../common/Modal";
import { TrashIcon } from "@heroicons/react/24/outline";

const Column = ({ projectId, boardId, column, onColumnsUpdate, onError }) => {
  const [cards, setCards] = useState(column.cards || []);
  const [editingCard, setEditingCard] = useState(null);
  const [editCardData, setEditCardData] = useState({ title: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Column title edit
  const [editingColumnTitle, setEditingColumnTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  // Add new card with default title and description
  const handleAddCard = async () => {
    setIsLoading(true);
    try {
      const res = await API.post(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}/cards`,
        { title: "New Card", description: "Enter details here..." }
      );
      const updatedCards = res.data;
      setCards(updatedCards);

      // Automatically open new card in edit mode
      const newCard = updatedCards[updatedCards.length - 1];
      setEditingCard(newCard._id);
      setEditCardData({ title: newCard.title, description: newCard.description || "Enter details here..." });
    } catch (err) {
      console.error("Error adding card:", err);
      onError("Failed to add card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit card
  const handleEditCard = async (cardId) => {
    if (!editCardData.title.trim()) {
      setEditingCard(null);
      setEditCardData({ title: "", description: "" });
      return;
    }
    try {
      const res = await API.patch(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}/cards/${cardId}`,
        { title: editCardData.title.trim(), description: editCardData.description.trim() }
      );
      setCards(prev => prev.map(c => (c._id === cardId ? res.data : c)));
      setEditingCard(null);
      setEditCardData({ title: "", description: "" });
    } catch (err) {
      console.error("Error editing card:", err);
      onError("Failed to edit card. Please try again.");
    }
  };

  // Delete card
  const handleDeleteCard = async (cardId) => {
    try {
      const res = await API.delete(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}/cards/${cardId}`
      );
      setCards(res.data);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting card:", err);
      onError("Failed to delete card. Please try again.");
    }
  };

  // Delete column
  const handleDeleteColumn = async () => {
    try {
      const res = await API.delete(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}`
      );
      onColumnsUpdate(res.data);
    } catch (err) {
      console.error("Error deleting column:", err);
      onError("Failed to delete column. Please try again.");
    }
  };

  // Edit column title
  const handleEditColumnTitle = async () => {
    if (!columnTitle.trim()) {
      setColumnTitle(column.title);
      setEditingColumnTitle(false);
      return;
    }
    try {
      await API.patch(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}`,
        { title: columnTitle.trim() }
      );
      onColumnsUpdate(prev =>
        prev.map(col => (col._id === column._id ? { ...col, title: columnTitle.trim() } : col))
      );
      setEditingColumnTitle(false);
    } catch (err) {
      console.error("Error updating column:", err);
      onError("Failed to update column title. Please try again.");
      setColumnTitle(column.title);
      setEditingColumnTitle(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-lg p-4 min-w-[280px] max-w-[300px] flex flex-col gap-2 shadow-md group transition-all hover:shadow-lg">
      {/* Column Header */}
      <div className="flex items-center justify-between">
        {editingColumnTitle ? (
          <input
            type="text"
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditColumnTitle();
              else if (e.key === "Escape") {
                setColumnTitle(column.title);
                setEditingColumnTitle(false);
              }
            }}
            onBlur={handleEditColumnTitle}
            autoFocus
            className="text-lg font-bold bg-transparent border-b-2 border-blue-400 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-100 px-1 py-0"
          />
        ) : (
          <h3
            className="text-md text-black dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-1 truncate"
            onDoubleClick={() => {
              setEditingColumnTitle(true);
              setColumnTitle(column.title);
            }}
          >
            {column.title}
          </h3>
        )}
        <button
          onClick={handleDeleteColumn}
          className="text-red-500 hover:text-red-700 p-1 ml-2 transition-opacity"
          title="Delete column"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Cards (only render if cards exist) */}
      {cards.length > 0 && (
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
          {cards.map((card) => (
            <Card
              key={card._id}
              card={card}
              editingCard={editingCard}
              editCardData={editCardData}
              setEditingCard={setEditingCard}
              setEditCardData={setEditCardData}
              handleEditCard={handleEditCard}
              handleDeleteCard={handleDeleteCard}
            />
          ))}
        </div>
      )}

      {/* Add New Card Button */}
      <div>
        <button
          onClick={handleAddCard}
          disabled={isLoading}
          className="w-full bg-primary-light dark:bg-primary-dark rounded-md p-2 text-white hover:opacity-90"
        >
          {isLoading ? "Adding..." : "+ Add Card"}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Card" className="z-50">
        <p className="text-center mb-6">
          Are you sure you want to delete this card? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setDeleteConfirm(null)} 
            className="px-5 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => handleDeleteCard(deleteConfirm)} 
            className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Column;
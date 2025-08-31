// ==================== COLUMN COMPONENT (Column.js) ====================
import React, { useState, useCallback } from "react";
import API from "../../api/API";
import Card from "./Card";
import Modal from "../common/Modal";

const Column = ({ projectId, boardId, column, onColumnsUpdate, onError }) => {
  const [cards, setCards] = useState(column.cards || []);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingCard, setEditingCard] = useState(null);
  const [editCardData, setEditCardData] = useState({ title: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add card
  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await API.post(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}/cards`,
        { title: newCardTitle.trim() }
      );
      setCards(res.data);
      setNewCardTitle("");
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
        { 
          title: editCardData.title.trim(),
          description: editCardData.description.trim()
        }
      );
      setCards((prev) =>
        prev.map((c) => (c._id === cardId ? res.data : c))
      );
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
  const [editingColumnTitle, setEditingColumnTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const handleEditColumnTitle = async () => {
    if (!columnTitle.trim()) {
      setColumnTitle(column.title);
      setEditingColumnTitle(false);
      return;
    }
    
    try {
      const res = await API.patch(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}`,
        { title: columnTitle.trim() }
      );
      // The response should be the updated column, not the full columns array
      // So we need to update columns differently
      onColumnsUpdate((prevColumns) => 
        prevColumns.map(col => 
          col._id === column._id ? { ...col, title: columnTitle.trim() } : col
        )
      );
      setEditingColumnTitle(false);
    } catch (err) {
      console.error("Error updating column:", err);
      onError("Failed to update column title. Please try again.");
      setColumnTitle(column.title);
      setEditingColumnTitle(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddCard();
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-gray-900 rounded-lg p-3 min-w-[280px] flex flex-col gap-2 shadow-md group">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-2">
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
            className="text-lg font-bold bg-transparent border-none outline-none flex-1 text-gray-900 dark:text-gray-100 p-0"
            style={{ 
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
          />
        ) : (
          <h3 
            className="text-lg font-bold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-1 px-0 py-0"
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
          className="text-red-500 hover:text-red-700 p-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete column"
        >
          🗑
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {cards.map((card) => (
          <div key={card._id} className="group">
            {editingCard === card._id ? (
              <div className="bg-white dark:bg-gray-700 p-3 rounded shadow">
                <input
                  type="text"
                  value={editCardData.title}
                  onChange={(e) => setEditCardData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full mb-2 px-0 py-0 border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 font-medium"
                  placeholder="Card title"
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
                <textarea
                  value={editCardData.description}
                  onChange={(e) => setEditCardData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-0 py-1 border-none outline-none bg-transparent text-gray-600 dark:text-gray-400 resize-none text-xs"
                  rows="2"
                  placeholder="Description (optional)"
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingCard(null);
                      setEditCardData({ title: "", description: "" });
                    }}
                    className="px-2 py-1 text-sm bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditCard(card._id)}
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <Card
                card={card}
                onEdit={() => {
                  setEditingCard(card._id);
                  setEditCardData({ 
                    title: card.title, 
                    description: card.description || "" 
                  });
                }}
                onDelete={() => setDeleteConfirm(card._id)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add New Card */}
      <div className="mt-2">
        <input
          type="text"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add new card..."
          disabled={isLoading}
          className="w-full px-3 py-2 rounded-md border border-gray-400 dark:border-gray-700 text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleAddCard}
          disabled={isLoading || !newCardTitle.trim()}
          className="w-full bg-gray-400 dark:bg-gray-800 rounded-md mt-2 p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding..." : "+ Add Card"}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)}
        title="Delete Card"
      >
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
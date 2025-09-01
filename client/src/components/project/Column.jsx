import React, { useState, useEffect } from "react";
import { useTheme } from "../../api/useTheme";
import API from "../../api/API";
import Card from "./Card";
import EditColumnModal from "../common/EditColumnModal";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export const COLOR_MAP = {
  grey: { light: { fill: "#D1D5DB", border: "#6B7280" }, dark: { fill: "#1f1f1f", border: "#9ca3af" } },
  red: { light: { fill: "#FCA5A5", border: "#DC2626" }, dark: { fill: "#2b0f0f", border: "#f87171" } },
  blue: { light: { fill: "#93C5FD", border: "#2563EB" }, dark: { fill: "#0d1117", border: "#4491f6" } },
  green: { light: { fill: "#86EFAC", border: "#16A34A" }, dark: { fill: "#0f1f0d", border: "#4ade80" } },
  pink: { light: { fill: "#F9A8D4", border: "#DB2777" }, dark: { fill: "#2b0f1f", border: "#f472b6" } },
  yellow: { light: { fill: "#FDE68A", border: "#CA8A04" }, dark: { fill: "#1f1c0d", border: "#facc15" } },
  orange: { light: { fill: "#FDBA74", border: "#EA580C" }, dark: { fill: "#2b160d", border: "#fb923c" } },
  purple: { light: { fill: "#C4B5FD", border: "#7C3AED" }, dark: { fill: "#0f0d1f", border: "#c084fc" } },
};

const Column = ({ projectId, boardId, column, onColumnsUpdate, onError }) => {
  const [cards, setCards] = useState(column.cards || []);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [columnColorKey, setColumnColorKey] = useState(column.color || "grey");
  const [editingColumnTitle, setEditingColumnTitle] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editCardData, setEditCardData] = useState({ title: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditColumn, setShowEditColumn] = useState(false);

  const isDarkMode = useTheme();
  const colorObj = COLOR_MAP[columnColorKey] || COLOR_MAP.grey;
  const fillColor = isDarkMode ? colorObj.dark.fill : colorObj.light.fill;
  const borderColor = isDarkMode ? colorObj.dark.border : colorObj.light.border;

  // Sync local state whenever parent column prop updates
  useEffect(() => {
    setCards(column.cards || []);
    setColumnTitle(column.title);
    setColumnColorKey(column.color || "grey");
  }, [column]);

  const handleAddCard = async () => {
    setIsLoading(true);
    try {
      const res = await API.post(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}/cards`,
        { title: "New Card", description: "Enter details here..." }
      );
      const updatedCards = res.data;
      setCards(updatedCards);
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

  const handleDeleteCard = async (cardId) => {
    try {
      const res = await API.delete(
        `/api/projects/${projectId}/boards/${boardId}/columns/${column._id}/cards/${cardId}`
      );
      setCards(res.data);
    } catch (err) {
      console.error("Error deleting card:", err);
      onError("Failed to delete card. Please try again.");
    }
  };

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
      onColumnsUpdate(prev => prev.map(col => (col._id === column._id ? { ...col, title: columnTitle.trim() } : col)));
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
        <div className="flex items-center gap-2 flex-1">
          <div className="w-4 h-4 rounded-full border-2" style={{ backgroundColor: fillColor, borderColor }} />
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
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowEditColumn(true)} className="text-gray-500 hover:text-blue-600 p-1 transition-opacity" title="Edit column">
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button onClick={handleDeleteColumn} className="text-red-500 hover:text-red-700 p-1 ml-1 transition-opacity" title="Delete column">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
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

      {/* Add New Card */}
      <button
        onClick={handleAddCard}
        disabled={isLoading}
        className="w-full bg-primary-light dark:bg-primary-dark rounded-md p-2 text-white hover:opacity-90"
      >
        {isLoading ? "Adding..." : "+ Add Card"}
      </button>

      {/* Edit Column Modal */}
      {showEditColumn && (
        <EditColumnModal
          projectId={projectId}
          boardId={boardId}
          column={column}
          colors={COLOR_MAP}
          onClose={() => setShowEditColumn(false)}
          onUpdated={(updatedCol) =>
            onColumnsUpdate(prev => prev.map(col => (col._id === updatedCol._id ? updatedCol : col)))
          }
        />
      )}
    </div>
  );
};

export default Column;

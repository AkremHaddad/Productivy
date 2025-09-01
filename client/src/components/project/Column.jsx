import React, { useState, useEffect } from "react";
import { useTheme } from "../../api/useTheme";
import API from "../../api/API";
import Card from "./Card";
import EditColumnModal from "../common/EditColumnModal";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export const COLOR_MAP = {
  grey: {
    light: { fill: "#E5E7EB", border: "#6B7280" },
    dark:  { fill: "#374151", border: "#9CA3AF" },
  },
  red: {
    light: { fill: "#FCA5A5", border: "#B91C1C" },
    dark:  { fill: "#7F1D1D", border: "#F87171" },
  },
  pink: {
    light: { fill: "#FBCFE8", border: "#BE185D" },
    dark:  { fill: "#701A3D", border: "#F472B6" },
  },
  orange: {
    light: { fill: "#FED7AA", border: "#C2410C" },
    dark:  { fill: "#7C2D12", border: "#FB923C" },
  },
  yellow: {
    light: { fill: "#FEF08A", border: "#A16207" },
    dark:  { fill: "#713F12", border: "#FACC15" },
  },
  blue: {
    light: { fill: "#93C5FD", border: "#2563EB" },
    dark:  { fill: "#1E3A8A", border: "#60A5FA" },
  },
  green: {
    light: { fill: "#86EFAC", border: "#15803D" },
    dark:  { fill: "#14532D", border: "#4ADE80" },
  },
  purple: {
    light: { fill: "#DDD6FE", border: "#6D28D9" },
    dark:  { fill: "#4C1D95", border: "#A78BFA" },
  },
};

const Column = ({ projectId, boardId, column, onColumnsUpdate, onError }) => {
  const [cards, setCards] = useState(column.cards || []);
  const [editingCard, setEditingCard] = useState(null);
  const [editCardData, setEditCardData] = useState({ title: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showEditColumn, setShowEditColumn] = useState(false);

  const isDarkMode = useTheme();
  const colorObj = COLOR_MAP[column.color || "grey"];
  const fillColor = isDarkMode ? colorObj.dark.fill : colorObj.light.fill;
  const borderColor = isDarkMode ? colorObj.dark.border : colorObj.light.border;

  useEffect(() => {
    setCards(column.cards || []);
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

  return (
    <div
      className="bg-white dark:bg-black rounded-lg p-4 min-w-[280px] max-w-[300px] flex flex-col gap-2 shadow-md group transition-all hover:shadow-lg"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-4 h-4 rounded-full border-[2.5px]" style={{ backgroundColor: fillColor, borderColor }} />
          <h3 className="text-md text-black dark:text-white flex-1 truncate">
            {column.title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowEditColumn(true)}
            className="text-gray-500 hover:text-blue-600 p-1 transition-opacity"
            title="Edit column"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteColumn}
            className="text-red-500 hover:text-red-700 p-1 ml-1 transition-opacity"
            title="Delete column"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 pr-2">
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
        className="w-7/12  bg-primary-light dark:bg-primary-dark rounded-md p-2 text-white hover:opacity-90 "
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

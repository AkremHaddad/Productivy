// ==================== CARD COMPONENT (Card.js) ====================
import React from 'react';

const Card = ({ card, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex justify-between items-start">
        <div className="flex-1" onDoubleClick={onEdit}>
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
              {card.description}
            </p>
          )}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity"
          title="Delete card"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default Card;
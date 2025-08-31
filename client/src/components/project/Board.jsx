
import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/API";
import Column from "./Column";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const Board = ({ projectId }) => {
  const [boards, setBoards] = useState([]);
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingBoard, setEditingBoard] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const currentBoard = boards[currentBoardIndex];

  // Fetch project boards
  const fetchBoards = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const res = await API.get(`/api/projects/${projectId}`);
      let fetchedBoards = res.data.boards || [];
      
      // Ensure each board has a columns array
      fetchedBoards = fetchedBoards.map(board => ({
        ...board,
        columns: Array.isArray(board.columns) ? board.columns : []
      }));
      
      // If no boards, create one automatically
      if (fetchedBoards.length === 0) {
        const newBoardRes = await API.post(`/api/projects/${projectId}/boards`, {
          title: "Main Board"
        });
        fetchedBoards = newBoardRes.data.map(board => ({
          ...board,
          columns: Array.isArray(board.columns) ? board.columns : []
        }));
      }
      
      setBoards(fetchedBoards);
      setCurrentBoardIndex(0);
    } catch (err) {
      console.error("Error fetching boards:", err);
      setError("Failed to load boards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Add board
  const handleAddBoard = async () => {
    try {
      const res = await API.post(`/api/projects/${projectId}/boards`, {
        title: "New Board"
      });
      const updatedBoards = res.data.map(board => ({
        ...board,
        columns: Array.isArray(board.columns) ? board.columns : []
      }));
      setBoards(updatedBoards);
      setCurrentBoardIndex(updatedBoards.length - 1);
    } catch (err) {
      console.error("Error adding board:", err);
      setError("Failed to add board. Please try again.");
    }
  };

  // Edit board title
  const handleEditBoard = async (boardId) => {
    if (!editBoardTitle.trim()) {
      setEditingBoard(null);
      setEditBoardTitle("");
      return;
    }
    
    try {
      const res = await API.patch(`/api/projects/${projectId}/boards/${boardId}`, {
        title: editBoardTitle.trim(),
      });
      setBoards((prev) =>
        prev.map((b) => (b._id === boardId ? res.data : b))
      );
      setEditingBoard(null);
      setEditBoardTitle("");
    } catch (err) {
      console.error("Error updating board:", err);
      setError("Failed to update board title. Please try again.");
    }
  };

  // Delete board
  const handleDeleteBoard = async (boardId) => {
    try {
      const res = await API.delete(`/api/projects/${projectId}/boards/${boardId}`);
      const updatedBoards = res.data.map(board => ({
        ...board,
        columns: Array.isArray(board.columns) ? board.columns : []
      }));
      setBoards(updatedBoards);
      setDeleteConfirm(null);
      setCurrentBoardIndex(0);
    } catch (err) {
      console.error("Error deleting board:", err);
      setError("Failed to delete board. Please try again.");
    }
  };

  // Add column
  const handleAddColumn = async () => {
    if (!currentBoard?._id) return;
    
    try {
      const res = await API.post(
        `/api/projects/${projectId}/boards/${currentBoard._id}/columns`,
        { title: "New Column" }
      );
      setBoards((prev) =>
        prev.map((b, i) =>
          i === currentBoardIndex ? { ...b, columns: res.data } : b
        )
      );
    } catch (err) {
      console.error("Error adding column:", err);
      setError("Failed to add column. Please try again.");
    }
  };

  // Update columns after column operations
  const updateColumns = useCallback((updater) => {
    setBoards((prev) =>
      prev.map((b, i) => {
        if (i === currentBoardIndex) {
          const newColumns = typeof updater === 'function' 
            ? updater(b.columns || []) 
            : updater;
          return { ...b, columns: newColumns };
        }
        return b;
      })
    );
  }, [currentBoardIndex]);

  if (error) {
    return (
      <div className="ml-1.5 bg-accent-light dark:bg-accent-dark rounded-md flex-1 overflow-hidden w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchBoards}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-1.5 bg-accent-light dark:bg-accent-dark rounded-md flex-1 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-black bg-opacity-25 min-h-[60px] font-normal text-3xl text-white flex items-center justify-between pl-4 pr-4 rounded-t-md">
        <div className="flex gap-2 overflow-x-auto">
          {boards.map((board, index) => (
            <div key={board._id} className="flex items-center gap-1 flex-shrink-0">
              {editingBoard === board._id ? (
                <input
                  type="text"
                  value={editBoardTitle}
                  onChange={(e) => setEditBoardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditBoard(board._id);
                    else if (e.key === "Escape") {
                      setEditingBoard(null);
                      setEditBoardTitle("");
                    }
                  }}
                  onBlur={() => handleEditBoard(board._id)}
                  autoFocus
                  className="px-3 py-1 bg-transparent text-white border-none outline-none"
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    minWidth: '100px'
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => {
                    setEditingBoard(board._id);
                    setEditBoardTitle(board.title);
                  }}
                  onClick={() => setCurrentBoardIndex(index)}
                  className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${
                    index === currentBoardIndex
                      ? "bg-gray-700 text-white"
                      : "bg-gray-500 text-gray-200 hover:bg-gray-600"
                  }`}
                >
                  {board.title}
                </span>
              )}

              {editingBoard !== board._id && boards.length > 1 && (
                <button
                  onClick={() => setDeleteConfirm(board._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete board"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          className="bg-gray-400 dark:bg-gray-800 rounded-md p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          onClick={handleAddBoard}
        >
          + Add Board
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : currentBoard ? (
        <div className="flex gap-4 p-4 overflow-x-auto h-full">
          {Array.isArray(currentBoard.columns) && currentBoard.columns.length > 0 ? (
            currentBoard.columns.map((col) => (
              <Column
                key={col._id}
                projectId={projectId}
                boardId={currentBoard._id}
                column={col}
                onColumnsUpdate={updateColumns}
                onError={setError}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No columns yet. Add your first column!</p>
            </div>
          )}
          <button
            onClick={handleAddColumn}
            className="min-w-[200px] max-h-[50px] bg-gray-400 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-center text-gray-800 dark:text-gray-400 shadow-md hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            + Add new column
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-text-light dark:text-text-dark/70">
          <p>No boards yet</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)}
        title="Delete Board"
      >
        <p className="text-center mb-6">
          Are you sure you want to delete this board? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-5 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteBoard(deleteConfirm)}
            className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Board;
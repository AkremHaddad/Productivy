import React, { useEffect, useState, useCallback, useRef } from "react";
import API from "../../api/API";
import Column from "./Column";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { addColumn } from "../../api/project";

const Board = ({ projectId }) => {
  const [boards, setBoards] = useState([]);
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingBoard, setEditingBoard] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const boardsContainerRef = useRef(null);

  // inline edit autosize refs
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  const currentBoard =
    boards.length > 0
      ? boards[Math.min(currentBoardIndex, boards.length - 1)]
      : null;

  // Fetch project boards
  const fetchBoards = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await API.get(`/api/projects/${projectId}`);
      let fetchedBoards = res.data.boards || [];

      // Ensure columns arrays exist
      fetchedBoards = fetchedBoards.map((b) => ({
        ...b,
        columns: Array.isArray(b.columns) ? b.columns : [],
      }));

      // If no boards, create one automatically
      if (fetchedBoards.length === 0) {
        const newBoardRes = await API.post(
          `/api/projects/${projectId}/boards`,
          { title: "Main Board" }
        );
        fetchedBoards = newBoardRes.data.map((b) => ({
          ...b,
          columns: Array.isArray(b.columns) ? b.columns : [],
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

  // Smooth horizontal scrolling with mouse wheel
  useEffect(() => {
    const container = boardsContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Autosize the inline input to its content
  useEffect(() => {
    if (!editingBoard || !inputRef.current || !measureRef.current) return;
    measureRef.current.textContent = editBoardTitle || " ";
    inputRef.current.style.width = `${measureRef.current.offsetWidth + 8}px`;
  }, [editingBoard, editBoardTitle]);

  // Add board
  const handleAddBoard = async () => {
    try {
      const res = await API.post(`/api/projects/${projectId}/boards`, {
        title: "New Board",
      });
      const updated = res.data.map((b) => ({
        ...b,
        columns: Array.isArray(b.columns) ? b.columns : [],
      }));
      setBoards(updated);
      setCurrentBoardIndex(updated.length - 1);
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
      const res = await API.patch(
        `/api/projects/${projectId}/boards/${boardId}`,
        { title: editBoardTitle.trim() }
      );
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
      const res = await API.delete(
        `/api/projects/${projectId}/boards/${boardId}`
      );
      const updated = res.data.map((b) => ({
        ...b,
        columns: Array.isArray(b.columns) ? b.columns : [],
      }));
      setBoards(updated);
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
      const newCol = await addColumn(projectId, currentBoard._id); // now newCol._id exists
      setBoards((prev) =>
        prev.map((b, i) =>
          i === currentBoardIndex
            ? { ...b, columns: [...(b.columns || []), newCol] }
            : b
        )
      );
    } catch (err) {
      console.error("Error adding column:", err);
      setError("Failed to add column. Please try again.");
    }
  };

  // Update columns after column operations
  const updateColumns = useCallback(
    (updater) => {
      setBoards((prev) =>
        prev.map((b, i) => {
          if (i !== currentBoardIndex) return b;
          const nextCols =
            typeof updater === "function" ? updater(b.columns || []) : updater;
          return { ...b, columns: nextCols };
        })
      );
    },
    [currentBoardIndex]
  );

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
    <div className="ml-1.5 bg-accent-light dark:bg-accent-dark rounded-md flex-1 overflow-hidden w-full flex flex-col">
      {/* Header (tabs) */}
      <div className="bg-black bg-opacity-25 min-h-[60px] font-normal text-3xl text-white flex items-stretch rounded-t-md border-b-2 border-black border-solid">
        <div
          ref={boardsContainerRef}
          className="flex overflow-x-auto flex-grow scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900"
        >
          {boards.map((board, index) => {
            const isActive = index === currentBoardIndex;
            return (
              <div
                key={board._id}
                className={`group flex items-stretch flex-shrink-0 px-2 transition-colors min-h-full border-r-2 border-black border-solid ${
                  isActive ? "bg-black bg-opacity-50" : "hover:bg-gray-600"
                }`}
              >
                {editingBoard === board._id ? (
                  <div className="relative flex items-center">
                    <span
                      ref={measureRef}
                      className="absolute -z-10 top-0 left-0 px-2 py-1 text-3xl font-normal whitespace-pre opacity-0 pointer-events-none"
                    />
                    <input
                      ref={inputRef}
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
                      className="bg-transparent text-white border-none outline-none h-full px-2 py-1"
                      style={{ minWidth: 24 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentBoardIndex(index)}
                    onDoubleClick={() => {
                      setEditingBoard(board._id);
                      setEditBoardTitle(board.title);
                    }}
                    className="h-full flex items-center px-2 text-white"
                    title="Double-click to rename"
                  >
                    <span className="truncate">{board.title}</span>
                  </button>
                )}

                {editingBoard !== board._id && boards.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(board._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity duration-200 flex items-center"
                    title="Delete board"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="bg-black bg-opacity-50 text-white hover:bg-opacity-25 transition-colors flex-shrink-0 px-4 flex items-center border-l-2 border-black border-solid"
          onClick={handleAddBoard}
          title="Add board"
        >
          +
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : currentBoard ? (
          <div className="flex gap-4 p-4 overflow-x-auto h-full">
            {Array.isArray(currentBoard.columns) &&
            currentBoard.columns.length > 0 ? (
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
              <div className="text-center text-gray-500 dark:text-gray-400">
              </div>
            )}
            <button
              onClick={handleAddColumn}
              className="min-w-[200px] max-h-[50px] bg-gray-400 dark:bg-black rounded-lg p-3 flex items-center justify-center text-gray-800 dark:text-gray-400 shadow-md hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              + Add new column
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-text-light dark:text-text-dark/70">
            <p>No boards yet</p>
          </div>
        )}
      </div>

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

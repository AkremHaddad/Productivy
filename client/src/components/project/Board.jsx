import React, { useEffect, useState, useCallback, useRef } from "react";
import API from "../../api/API";
import Column from "./Column";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import { addColumn, reorderColumns } from "../../api/project";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { reorderCards } from "../../api/project";


const Board = ({ projectId }) => {
  const [boards, setBoards] = useState([]);
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingBoard, setEditingBoard] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const boardsContainerRef = useRef(null);
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  const currentBoard =
    boards.length > 0
      ? boards[Math.min(currentBoardIndex, boards.length - 1)]
      : null;

  const fetchBoards = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await API.get(`/api/projects/${projectId}`);
      let fetchedBoards = res.data.boards || [];

      fetchedBoards = fetchedBoards.map((b) => ({
        ...b,
        columns: Array.isArray(b.columns) ? b.columns : [],
      }));

      if (fetchedBoards.length === 0) {
        const newBoardRes = await API.post(`/api/projects/${projectId}/boards`, { title: "Main Board" });
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

  useEffect(() => {
    if (!editingBoard || !inputRef.current || !measureRef.current) return;
    measureRef.current.textContent = editBoardTitle || " ";
    inputRef.current.style.width = `${measureRef.current.offsetWidth + 8}px`;
  }, [editingBoard, editBoardTitle]);

  const handleAddBoard = async () => {
    try {
      const res = await API.post(`/api/projects/${projectId}/boards`, { title: "New Board" });
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

  const handleEditBoard = async (boardId) => {
    if (!editBoardTitle.trim()) {
      setEditingBoard(null);
      setEditBoardTitle("");
      return;
    }
    try {
      const res = await API.patch(`/api/projects/${projectId}/boards/${boardId}`, { title: editBoardTitle.trim() });
      setBoards((prev) => prev.map((b) => (b._id === boardId ? res.data : b)));
      setEditingBoard(null);
      setEditBoardTitle("");
    } catch (err) {
      console.error("Error updating board:", err);
      setError("Failed to update board title. Please try again.");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      const res = await API.delete(`/api/projects/${projectId}/boards/${boardId}`);
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

  const handleAddColumn = async () => {
    if (!currentBoard?._id) return;
    try {
      const newCol = await addColumn(projectId, currentBoard._id);
      setBoards((prev) =>
        prev.map((b, i) =>
          i === currentBoardIndex ? { ...b, columns: [...(b.columns || []), newCol] } : b
        )
      );
    } catch (err) {
      console.error("Error adding column:", err);
      setError("Failed to add column. Please try again.");
    }
  };

  const updateColumns = useCallback(
    (updater) => {
      setBoards((prev) =>
        prev.map((b, i) => {
          if (i !== currentBoardIndex) return b;
          const nextCols = typeof updater === "function" ? updater(b.columns || []) : updater;
          return { ...b, columns: nextCols };
        })
      );
    },
    [currentBoardIndex]
  );

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination || !currentBoard) return;

    if (type === "COLUMN") {
      const newCols = Array.from(currentBoard.columns);
      const [moved] = newCols.splice(source.index, 1);
      newCols.splice(destination.index, 0, moved);
      updateColumns(newCols);

      // Persist to backend
      if (currentBoard._id) {
        const newOrderIds = newCols.map(col => col._id);
        reorderColumns(projectId, currentBoard._id, newOrderIds)
          .catch(err => {
            console.error("Failed to save column order:", err);
            setError("Failed to save column order. Please try again.");
          });
      }

      return;
    }

    if (type === "CARD") {
      const sourceColIndex = currentBoard.columns.findIndex(c => c._id === source.droppableId);
      const destColIndex = currentBoard.columns.findIndex(c => c._id === destination.droppableId);
      const sourceCol = currentBoard.columns[sourceColIndex];
      const destCol = currentBoard.columns[destColIndex];

      const newSourceCards = Array.from(sourceCol.cards);
      const [movedCard] = newSourceCards.splice(source.index, 1);

      // If moved inside the same column
      if (source.droppableId === destination.droppableId) {
        newSourceCards.splice(destination.index, 0, movedCard);
        const newCols = [...currentBoard.columns];
        newCols[sourceColIndex].cards = newSourceCards;
        updateColumns(newCols);

        // Persist order to backend
        const payload = newCols.map(col => ({ _id: col._id, cards: col.cards.map(c => c._id) }));
        reorderCards(projectId, currentBoard._id, payload).catch((err) => {
          console.error("Failed to save card order:", err);
          setError("Failed to save card order. Please try again.");
          // (Optional) re-fetch or rollback if you want stronger consistency
          // fetchBoards(); 
        });
      } else {
        // Moved to another column
        const newDestCards = Array.from(destCol.cards);
        newDestCards.splice(destination.index, 0, movedCard);

        const newCols = [...currentBoard.columns];
        newCols[sourceColIndex].cards = newSourceCards;
        newCols[destColIndex].cards = newDestCards;
        updateColumns(newCols);

        // Persist order to backend
        const payload = newCols.map(col => ({ _id: col._id, cards: col.cards.map(c => c._id) }));
        reorderCards(projectId, currentBoard._id, payload).catch((err) => {
          console.error("Failed to save card order:", err);
          setError("Failed to save card order. Please try again.");
          // (Optional) re-fetch or rollback
          // fetchBoards();
        });
      }
      return;
    }

  };

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
    <div className="bg-gradient-to-r from-[#2E837F] to-[#40C1BB] dark:from-[#113533] dark:to-[#2D8984] rounded-md flex-1 overflow-hidden w-full h-[622px] flex flex-col border border-gray-300 dark:border-gray-700">
      
      {/* Header Tabs */}
      <div className="bg-black bg-opacity-25 min-h-[60px] font-normal text-3xl text-white flex items-stretch rounded-t-md border-b-2 border-black border-solid">
        <div
          ref={boardsContainerRef}
          className="flex overflow-x-auto flex-grow scrollbar-thin scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-700"
        >
          {boards.map((board, index) => {
            const isActive = index === currentBoardIndex;
            return (
              <div
                key={board._id}
                className={`group flex items-stretch flex-shrink-0 px-2 transition-colors min-h-full border-r-2 border-black border-solid ${
                  isActive ? "bg-black/50 dark:bg-black/50" : "hover:bg-black/20 dark:hover:bg-white/10"
                }`}
              >
                {editingBoard === board._id ? (
                  <div className="relative flex items-center">
                    <span ref={measureRef} className="absolute -z-10 top-0 left-0 px-2 py-1 text-3xl font-normal whitespace-pre opacity-0 pointer-events-none"/>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              className="flex overflow-x-auto overflow-y-auto p-4 gap-4 items-start scrollbar-none scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-700 h-full"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-64 w-full">
                  <LoadingSpinner />
                </div>
              ) : currentBoard ? (
                <>
                  {currentBoard.columns.map((col, idx) => (
                    <Draggable draggableId={col._id} index={idx} key={col._id}>
                      {(colProvided) => (
                        <div ref={colProvided.innerRef} {...colProvided.draggableProps} {...colProvided.dragHandleProps}>
                          <Column
                            projectId={projectId}
                            boardId={currentBoard._id}
                            column={col}
                            onColumnsUpdate={updateColumns}
                            onError={setError}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                  <button
                    onClick={handleAddColumn}
                    className="min-w-[200px] max-h-[50px] bg-gray-400 dark:bg-black rounded-lg p-3 flex items-center justify-center text-gray-800 dark:text-gray-400 shadow-md hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  >
                    + Add new column
                  </button>
                  {provided.placeholder}
                </>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">No boards yet</div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Board">
        <p className="text-text-light dark:text-text-dark text-center">
          Are you sure you want to delete this board? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-5 py-2 rounded-lg bg-navbar-light/30 dark:bg-navbar-dark/80 text-text-light dark:text-text-dark hover:bg-navbar-light/50 dark:hover:bg-navbar-dark transition-all duration-200 font-medium border border-transparent hover:border-secondary-light/30 dark:hover:border-accent/30"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteBoard(deleteConfirm)}
            className="px-5 py-2 rounded-lg bg-red-500 dark:bg-red-600 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-700 transform hover:scale-[1.02]"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Board;

import { useContext } from "react";
import { PomodoroContext } from "../context/pomodoroContextInstance";

export const usePomodoro = () => {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoro must be used within a PomodoroProvider");
  return ctx;
};

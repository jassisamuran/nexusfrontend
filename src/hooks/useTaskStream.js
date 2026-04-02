// frontend/src/hooks/useTaskStream.js
import { useCallback, useEffect, useRef, useState } from "react";
import { createTaskWebSocket, getTask } from "../api";

export function useTaskStream(taskId) {
  const [events, setEvents] = useState([]);
  const [taskData, setTaskData] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    const data = await getTask(taskId);
    if (data) setTaskData(data);

    return data;
  }, [taskId]);

  const addEvent = useCallback((event) => {
    setEvents((prev) => [event, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    if (!taskId) return;

    loadTask();

    setEvents([]);

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = createTaskWebSocket(
      taskId,
      (message) => {
        addEvent(message);

        if (message.event_type === "COMPLETE") {
          setTaskData((prev) =>
            prev
              ? { ...prev, status: "complete", progress_percent: 100 }
              : prev,
          );
          loadTask();
        }
        if (message.event_type === "FAILED") {
          setTaskData((prev) => (prev ? { ...prev, status: "failed" } : prev));
        }
        if (message.event_type === "STAGE_START") {
          const stageProgress = {
            Cloning: 10,
            Indexing: 20,
            Planning: 30,
            Coding: 50,
            Testing: 70,
            Reviewing: 85,
            PR: 95,
          };
          const msg = message.message || "";
          for (const [key, val] of Object.entries(stageProgress)) {
            if (msg.toLowerCase().includes(key.toLowerCase())) {
              setTaskData((prev) =>
                prev ? { ...prev, progress_percent: val } : prev,
              );
              break;
            }
          }
        }
      },
      () => {
        setConnected(false);
        pollRef.current = setInterval(async () => {
          const data = await loadTask();
          if (data && ["complete", "failed"].includes(data.status)) {
            clearInterval(pollRef.current);
          }
        }, 3000);
      },
    );

    wsRef.current = ws;
    ws.onopen = () => setConnected(true);

    return () => {
      ws.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [taskId, loadTask, addEvent]);

  return { events, taskData, connected };
}

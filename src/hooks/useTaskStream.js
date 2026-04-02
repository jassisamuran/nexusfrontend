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
    if (data) {
      setTaskData(data);
    }

    return data;
  }, [taskId]);

  const addEvent = useCallback((event) => {
    setEvents((prev) => [event, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    if (!taskId) return;
    console.log(`[EFFECT START] taskId=${taskId}`);

    let intentionallyClosed = false; // ← LOCAL to THIS effect instance, not a ref

    loadTask();

    setEvents([]);
    setTaskData(null);

    if (wsRef.current) {
      console.log(`[CLOSING OLD WS] before creating new one`);

      wsRef.current.close();
    }

    const ws = createTaskWebSocket(
      taskId,
      (message) => {
        console.log("now is", message);
        console.log(`[MESSAGE] taskId=${taskId}`, message);

        addEvent(message);

        if (message.event_type === "COMPLETE") {
          setTaskData((prev) => ({ ...prev, status: "complete" }));

          loadTask();
        }
        if (message.event_type === "FAILED") {
          setTaskData((prev) => (prev ? { ...prev, status: "failed" } : prev));
          loadTask(); // ✅ add this — verify against DB
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
                prev ? { ...prev, progress_percent: val, status: key } : prev,
              );
              break;
            }
          }
        }
      },
      () => {
        setConnected(false);
        if (intentionallyClosed) return; // ← DON'T poll on intentional close

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
      intentionallyClosed = true; // ← sets THIS closure's variable, old onclose reads THIS
      ws.close();
      loadTask();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [taskId, loadTask, addEvent]);

  return { events, taskData, connected, loadTask };
}

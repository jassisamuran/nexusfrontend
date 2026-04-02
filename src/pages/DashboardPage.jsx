import { useEffect, useState } from "react";
import { listTasks } from "../api";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { useAuth } from "../hooks/useAuth";
import { useTaskStream } from "../hooks/useTaskStream";
export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");
  const { events, taskData } = useTaskStream(activeTaskId);

  async function loadTasks() {
    const data = await listTasks();
    setTasks(data);
    setActiveTaskId((prev) => {
      if (prev) return prev; // already tracking something, don't override
      const running = data.find(
        (t) => !["complete", "failed"].includes(t.status),
      );
      return running ? running.id : prev;
    });
    console.log("ok!!!!!!!!", data);
  }

  useEffect(() => {
    if (taskData?.status === "complete" || taskData?.status === "failed") {
      loadTasks();
      refreshUser();
    }
  }, [taskData?.status]);

  useEffect(() => {
    loadTasks();
    console.log("jhhihi");
  }, []);

  function handleTaskCreated(taskId) {
    setActiveTaskId(taskId);
    loadTasks();
  }

  function hanldeSelectTask(taskId) {
    setActiveTaskId(taskId);
    setActiveTab("feed");
  }
  return (
    <div>
      <div>
        <h2>Dashboard</h2>
        {user && <p>{user.username}</p>}
        <button onClick={logout}>Logout</button>
      </div>
      <div>
        <TaskForm onTaskCreated={handleTaskCreated} />
      </div>
      {/* <div>
        <button onClick={() => handleTaskCreated("dummy-task-id")}>
          Create Task (dummy)
        </button>
      </div> */}

      <div>
        <h3>Tasks</h3>
        <TaskList tasks={tasks} activeTaskId={activeTaskId} />
        {/* {tasks.map((task) => (
          <div key={task.id}>
            <button onClick={() => setActiveTaskId(task.id)}>
              {task.task_description}
            </button>
          </div>
        ))} */}
      </div>
      <div>
        <h3>Active Task</h3>

        {!activeTaskId && <p>No task selected</p>}

        {taskData && (
          <div>
            <p>Status: {taskData.status}</p>
            <p>Progress: {taskData.progress_percent}</p>
          </div>
        )}

        <div>
          <h4>Events</h4>
          {events.map((e, i) => (
            <div key={i}>
              <p>{e.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

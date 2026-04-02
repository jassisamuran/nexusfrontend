import { useState } from "react";
import { createTask } from "../api";

const EXAMPLES = [
  "Add JWT authentication with refresh tokens",
  "Add Redis caching to all GET endpoints",
  "Write unit tests for all existing functions",
  "Add input validation and error handling",
  "Add structured JSON logging to all routes",
];
const TaskForm = ({ onTaskCreated }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!repoUrl.includes("github.com")) {
      setError("Only Github repositories supported");
      return;
    }

    if (taskDesc.trim().length < 10) {
      setError("Task description must be atleast 10 characters");
    }

    setLoading(true);

    try {
      const data = await createTask(repoUrl.trim(), taskDesc.trim());
      if (data) {
        setRepoUrl("");
        setTaskDesc("");
        onTaskCreated(data.task_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div>New Task</div>
      {error && <div>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Github Repository Url</label>
          <input
            type="text"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label> What do you want to build</label>
          <textarea
            placeholder="Desribe the change in plain English..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            required
          />
        </div>
        <div>
          <div>Examples</div>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setTaskDesc(ex)}>
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Starting..." : "Start Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;

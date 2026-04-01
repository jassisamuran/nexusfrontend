export default function TastList({ tasks, activeTaskId, onSelect }) {
  if (!tasks.length) {
    return (
      <div>
        <div>Your Tasks</div>
        <div>No tasks yet</div>
      </div>
    );
  }

  <div>
    <div>Your tasks</div>
    {tasks.map((task) => {
      const repo = task.repo_url.replace("https://github.com/", "");
      const isActive = task.id === activeTaskId;
      const time = task.created_at
        ? new Date(task.created_at).toLocaleString()
        : "";

      return (
        <div>
          <div>{repo}</div>
          <div>
            {task.task_description.length > 60
              ? task.task_description.slice(0, 60) + "..."
              : task.task_description}
          </div>
          <div>
            <span>{time}</span>
            <span>{task.status}</span>
          </div>
        </div>
      );
    })}
  </div>;
}

import { METHOD, STORAGE_KEYS } from "./constants";

const BASE = "";

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function setTokens(acess, refresh) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, acess);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

async function refreshAccesstoken() {
  const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refresh) return false;

  try {
    const res = await fetch("/auth/refresh", {
      method: METHOD.POST,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);

    return true;
  } catch {
    return false;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshAccesstoken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getToken()}`;
      res = await fetch(BASE, { ...options, headers });
      return res;
    } else {
      clearToken();
      window.location.href = "/login";
      return null;
    }
  }
  return res;
}

export async function login(email, password) {
  const res = await fetch("/auth/login", {
    method: METHOD.POST,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.details || "Login failed");
  setTokens(data.access_token, data.refresh_token);
}

export async function register(username, email, password) {
  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.details || "Registration failed");
  return data;
}

// Task endponts

export async function createTask(repoUrl, taskDescription) {
  const res = await apiFetch("/tasks/", {
    method: "POST",
    body: JSON.stringify({
      repo_url: repoUrl,
      task_description: taskDescription,
    }),
  });
  if (!res) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create task");
  return data;
}

export async function listTasks() {
  const res = await apiFetch("/tasks/");

  if (!res) return [];
  const data = await res.json();
  console.log("data is", data);
  return data.tasks || [];
}

export async function getTask(taskId) {
  const res = await apiFetch(`/tasks/${taskId}`);
  if (!res) return null;
  return res.json();
}

export async function getMe() {
  const res = await apiFetch("/auth/me");
  if (!res) return null;
  return res.json();
}

export function createTaskWebSocket(taskId, onMessage, onClose) {
  const token = getToken();
  const wsUrl = `ws://localhost:8000/tasks/ws/${taskId}?token=${token}`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch {
      console.log("WS parse error", e.data);
    }
  };

  ws.onclose = () => onClose && onClose();
  ws.onerror = (e) => console.log("'ws error", e);
  return ws;
}

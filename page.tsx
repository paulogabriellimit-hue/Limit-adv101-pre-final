'use client';
import React, { useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'todos_v1';

export default function Page(): React.JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'completed'>('todos');
  const [editing, setEditing] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // load from localStorage (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw) as Todo[]);
    } catch {}
  }, []);

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {}
  }, [todos]);

  const openAdd = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setModalOpen(true);
  };

  const openEdit = (t: Todo) => {
    setEditing(t);
    setTitle(t.title);
    setDescription(t.description || '');
    setModalOpen(true);
  };

  const create = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = Date.now();
    const todo: Todo = {
      id: String(now),
      title: trimmed,
      description: description.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    setTodos((s) => [todo, ...s]);
    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const update = () => {
    if (!editing) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    const updated: Todo = {
      ...editing,
      title: trimmed,
      description: description.trim(),
      updatedAt: Date.now(),
    };
    setTodos((s) => s.map((x) => (x.id === updated.id ? updated : x)));
    setEditing(null);
    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const remove = (id: string) => {
    if (!confirm('Delete this todo?')) return;
    setTodos((s) => s.filter((t) => t.id !== id));
  };

  const toggle = (id: string) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t)));
  };

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      todos.filter((t) => {
        if (filter === 'todos' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;
        if (!q) return true;
        return (t.title + ' ' + (t.description || '')).toLowerCase().includes(q);
      }),
    [todos, search, filter]
  );

  const fmt = (ts: number) =>
    new Date(ts).toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <main className="page-root">
      <div className="container">
        <header className="card header-card">
          <div className="search-wrap">
            <label className="search-icon" aria-hidden={true}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </label>
            <input
              aria-label="Search todos"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input search-input"
            />
            <button className="btn btn-primary" onClick={openAdd}>
              + Add Todo
            </button>
          </div>

            <div className="tabs">
            <button
              className={`tab ${filter === 'todos' ? 'active' : ''}`}
              onClick={() => setFilter('todos')}
            >
              To Do
            </button>
            <button
              className={`tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </header>

        <section className="card table-card">
          <table className="todo-table" role="table" aria-label="Todo list">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className={t.completed ? 'row-completed' : ''}>
                  <td className="mono">{t.id}</td>
                  <td className="title-cell">{t.title}</td>
                  <td className="desc-cell">{t.description}</td>
                  <td className="muted">{fmt(t.updatedAt || t.createdAt)}</td>
                  <td className="actions">
                    <button
                      className="icon-btn edit"
                      title="Edit"
                      onClick={() => openEdit(t)}
                      aria-label="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 21v-3.6L14.8 5.6l3.6 3.6L6.6 21H3z"
                          stroke="none"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      className="icon-btn delete"
                      title="Delete"
                      onClick={() => remove(t.id)}
                      aria-label="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"
                          stroke="none"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button className="btn btn-success small" onClick={() => toggle(t.id)}>
                      {t.completed ? 'Undo' : 'Done'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    No todos found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">{editing ? 'Edit Todo' : 'Add Todo'}</h3>
            <div className="form-row">
              <label className="label">Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-row">
              <label className="label">Description</label>
              <textarea
                className="input textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                  setTitle('');
                  setDescription('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={editing ? update : create}
              >
                {editing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #f7fafc 0%, #f3f4f6 100%);
          padding: 36px 20px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          color: #111827;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
          padding: 18px;
        }
        .header-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 18px;
        }
        .search-wrap {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .search-icon {
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding-left: 8px;
        }
        .input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e6e9ee;
          border-radius: 10px;
          background: #fff;
          font-size: 14px;
          color: #111827;
          outline: none;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .input:focus {
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
          border-color: #2563eb;
        }
        .search-input {
          max-width: 720px;
          display: block;
        }
        .tabs {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .tab {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          color: #374151;
          cursor: pointer;
          font-weight: 600;
        }
        .tab.active {
          background: linear-gradient(180deg, #eef2ff, #eef7ff);
          color: #3730a3;
          border-color: #e0e7ff;
          box-shadow: inset 0 -2px 0 rgba(99, 102, 241, 0.08);
        }
        .btn {
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          border-radius: 10px;
          padding: 10px 14px;
        }
        .btn-primary {
          background: linear-gradient(180deg, #4f46e5, #4338ca);
          color: #fff;
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.18);
        }
        .btn-primary:hover {
          transform: translateY(-1px);
        }
        .btn-ghost {
          background: transparent;
          border: 1px solid #e6e6e6;
          color: #374151;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .btn-success {
          background: linear-gradient(180deg, #10b981, #059669);
          color: #fff;
          padding: 8px 10px;
          border-radius: 8px;
          font-weight: 600;
        }
        .small {
          padding: 6px 10px;
          font-size: 13px;
    }
        .table-card {
          padding: 8px;
        }
        .todo-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        thead th {
          text-align: left;
          font-size: 12px;
          color: #6b7280;
          padding: 12px 16px;
          border-bottom: 1px solid #eef2f7;
        }
        tbody td {
          padding: 12px 16px;
          vertical-align: middle;
          border-bottom: 1px solid #f3f4f6;
        }
        .mono {
          color: #6b7280;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace;
          font-size: 13px;
        }
        .title-cell {
          font-weight: 600;
          color: #111827;
        }
        .desc-cell {
          color: #4b5563;
          max-width: 420px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .muted {
          color: #6b7280;
        }
        .actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .icon-btn {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: #f8fafc;
          color: #374151;
          transition: transform 0.12s;
        }
        .icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(2, 6, 23, 0.06);
        }
        .icon-btn.edit {
          background: linear-gradient(180deg, #dbeafe, #e8f0ff);
          color: #1e40af;
        }
        .icon-btn.delete {
          background: linear-gradient(180deg, #fee2e2, #fff1f2);
          color: #991b1b;
        }
        .row-completed .title-cell {
          text-decoration: line-through;
          color: #6b7280;
        }
        .empty {
          text-align: center;
          padding: 28px 16px;
          color: #9ca3af;
        }
        /* modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
          padding: 20px;
        }
        .modal {
          width: 100%;
          max-width: 520px;
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 20px 60px rgba(2, 6, 23, 0.3);
        }
        .modal-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: #0f172a;
        }
        .form-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .label {
          font-size: 13px;
          color: #374151;
          font-weight: 600;
        }
        .textarea {
          min-height: 96px;
          resize: vertical;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }
        @media (max-width: 640px) {
          .search-wrap {
            flex-direction: column;
            align-items: stretch;
          }
          .btn {
            width: 100%;
            justify-content: center;
          }
          .tabs {
            justify-content: space-between;
          }
        }
      `}</style>
    </main>
  );
}

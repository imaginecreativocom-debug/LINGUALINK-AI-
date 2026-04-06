import React, { useMemo, useState } from 'react';

type ColumnId = 'todo' | 'doing' | 'done';

interface Card {
  id: string;
  title: string;
  description: string;
  assignee: string;
  notifyEmail: string;
  dueDate: string;
  createdAt: number;
}

interface BoardState {
  todo: Card[];
  doing: Card[];
  done: Card[];
}

const COLUMN_META: Record<ColumnId, { label: string; color: string }> = {
  todo: { label: 'Por hacer', color: 'bg-sky-500/20 text-sky-200 border-sky-400/40' },
  doing: { label: 'En progreso', color: 'bg-amber-500/20 text-amber-200 border-amber-400/40' },
  done: { label: 'Completado', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' },
};

const createCard = (title: string, description: string, assignee: string, notifyEmail: string, dueDate: string): Card => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title,
  description,
  assignee,
  notifyEmail,
  dueDate,
  createdAt: Date.now(),
});

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>({
    todo: [
      createCard('Diseñar landing', 'Crear estructura inicial de la landing principal', 'Andrea', 'andrea@empresa.com', ''),
    ],
    doing: [
      createCard('Configurar backend', 'Definir endpoints y autenticación', 'Luis', 'luis@empresa.com', ''),
    ],
    done: [
      createCard('Kickoff', 'Reunión de arranque con el equipo', 'Equipo', '', ''),
    ],
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [activeColumn, setActiveColumn] = useState<ColumnId>('todo');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<ColumnId | null>(null);

  const totalCards = useMemo(
    () => board.todo.length + board.doing.length + board.done.length,
    [board],
  );

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) return;

    const card = createCard(newTitle.trim(), newDescription.trim(), newAssignee.trim(), newEmail.trim(), newDueDate);

    setBoard((prev) => ({
      ...prev,
      [activeColumn]: [card, ...prev[activeColumn]],
    }));

    setNewTitle('');
    setNewDescription('');
    setNewAssignee('');
    setNewEmail('');
    setNewDueDate('');
  };

  const deleteCard = (columnId: ColumnId, cardId: string) => {
    setBoard((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((card) => card.id !== cardId),
    }));
  };

  const editCard = (columnId: ColumnId, cardId: string) => {
    const card = board[columnId].find((item) => item.id === cardId);
    if (!card) return;

    const title = prompt('Editar título', card.title);
    if (title === null) return;

    const description = prompt('Editar descripción', card.description);
    if (description === null) return;

    const assignee = prompt('Editar responsable', card.assignee);
    if (assignee === null) return;

    const notifyEmail = prompt('Editar email de notificación', card.notifyEmail);
    if (notifyEmail === null) return;

    setBoard((prev) => ({
      ...prev,
      [columnId]: prev[columnId].map((item) =>
        item.id === cardId
          ? {
              ...item,
              title: title.trim() || item.title,
              description: description.trim(),
              assignee: assignee.trim(),
              notifyEmail: notifyEmail.trim(),
            }
          : item,
      ),
    }));
  };

  const moveCard = (source: ColumnId, destination: ColumnId, cardId: string, index?: number) => {
    if (source === destination && index === undefined) return;

    setBoard((prev) => {
      const card = prev[source].find((item) => item.id === cardId);
      if (!card) return prev;

      const sourceCards = prev[source].filter((item) => item.id !== cardId);
      const destinationCards = [...(source === destination ? sourceCards : prev[destination])];

      if (typeof index === 'number') {
        destinationCards.splice(index, 0, card);
      } else {
        destinationCards.unshift(card);
      }

      return {
        ...prev,
        [source]: source === destination ? destinationCards : sourceCards,
        [destination]: destinationCards,
      };
    });
  };

  const moveWithinColumn = (column: ColumnId, cardId: string, direction: 'up' | 'down') => {
    setBoard((prev) => {
      const cards = [...prev[column]];
      const currentIndex = cards.findIndex((card) => card.id === cardId);
      if (currentIndex === -1) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= cards.length) return prev;

      [cards[currentIndex], cards[targetIndex]] = [cards[targetIndex], cards[currentIndex]];

      return {
        ...prev,
        [column]: cards,
      };
    });
  };

  const sendNotificationEmail = (card: Card, column: ColumnId) => {
    if (!card.notifyEmail.trim()) {
      alert('Esta tarjeta no tiene un correo de notificación configurado.');
      return;
    }

    const subject = encodeURIComponent(`Notificación de tarea: ${card.title}`);
    const body = encodeURIComponent(
      `Hola,\n\nSe requiere atención en la tarea:\n- Título: ${card.title}\n- Estado: ${COLUMN_META[column].label}\n- Responsable: ${card.assignee || 'Sin responsable'}\n- Descripción: ${card.description || 'Sin descripción'}\n\nSaludos.`,
    );

    window.location.href = `mailto:${card.notifyEmail}?subject=${subject}&body=${body}`;
  };

  const handleDragStart = (columnId: ColumnId, cardId: string) => {
    setDraggedCardId(cardId);
    setDraggedFromColumn(columnId);
  };

  const handleDrop = (destinationColumn: ColumnId) => {
    if (!draggedCardId || !draggedFromColumn) return;

    moveCard(draggedFromColumn, destinationColumn, draggedCardId);
    setDraggedCardId(null);
    setDraggedFromColumn(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-indigo-300">Mini Trello - Tablero Kanban</h1>
          <p className="text-slate-300">
            Gestiona tareas con columnas, edición, borrado, drag & drop y avisos por correo.
          </p>
          <p className="text-sm text-slate-400">Total de tarjetas: {totalCards}</p>
        </header>

        <section className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Crear nueva tarjeta</h2>
          <form onSubmit={addCard} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <input
              className="xl:col-span-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              placeholder="Título *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <input
              className="xl:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              placeholder="Descripción"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <input
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              placeholder="Responsable"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
            />
            <input
              type="email"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              placeholder="correo@empresa.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="date"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
            <select
              value={activeColumn}
              onChange={(e) => setActiveColumn(e.target.value as ColumnId)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
            >
              {Object.entries(COLUMN_META).map(([id, meta]) => (
                <option key={id} value={id}>
                  {meta.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="xl:col-span-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 font-semibold"
            >
              Añadir tarea
            </button>
          </form>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(Object.keys(COLUMN_META) as ColumnId[]).map((columnId) => (
            <section
              key={columnId}
              className="bg-slate-900 border border-slate-700 rounded-xl p-3 min-h-[320px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(columnId)}
            >
              <div className={`rounded-lg border px-3 py-2 mb-3 ${COLUMN_META[columnId].color}`}>
                <h3 className="font-semibold">{COLUMN_META[columnId].label}</h3>
                <p className="text-xs opacity-80">{board[columnId].length} tarjeta(s)</p>
              </div>

              <div className="space-y-3">
                {board[columnId].map((card, index) => (
                  <article
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(columnId, card.id)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-2 cursor-grab"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-slate-100">{card.title}</h4>
                      <span className="text-xs text-slate-400">#{index + 1}</span>
                    </div>

                    {card.description && <p className="text-sm text-slate-300">{card.description}</p>}

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Responsable: {card.assignee || 'Sin asignar'}</p>
                      <p>Correo alerta: {card.notifyEmail || 'No configurado'}</p>
                      <p>Fecha límite: {card.dueDate || 'Sin fecha'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => moveWithinColumn(columnId, card.id, 'up')}
                        className="bg-slate-700 hover:bg-slate-600 rounded px-2 py-1 text-xs"
                      >
                        Subir
                      </button>
                      <button
                        onClick={() => moveWithinColumn(columnId, card.id, 'down')}
                        className="bg-slate-700 hover:bg-slate-600 rounded px-2 py-1 text-xs"
                      >
                        Bajar
                      </button>
                      <button
                        onClick={() => editCard(columnId, card.id)}
                        className="bg-blue-700 hover:bg-blue-600 rounded px-2 py-1 text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCard(columnId, card.id)}
                        className="bg-red-700 hover:bg-red-600 rounded px-2 py-1 text-xs"
                      >
                        Borrar
                      </button>
                      <button
                        onClick={() => sendNotificationEmail(card, columnId)}
                        className="col-span-2 bg-indigo-700 hover:bg-indigo-600 rounded px-2 py-1 text-xs"
                      >
                        Notificar por correo
                      </button>
                    </div>
                  </article>
                ))}

                {board[columnId].length === 0 && (
                  <p className="text-sm text-slate-500 border border-dashed border-slate-700 rounded-lg p-3 text-center">
                    Arrastra tareas aquí.
                  </p>
                )}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default App;

import { useState } from 'react';

export type DataColumn<T> = {
  readonly key: keyof T & string;
  readonly header: string;
};

type DataTableProps<T> = {
  readonly rows: readonly T[];
  readonly columns: readonly DataColumn<T>[];
  readonly getRowId: (row: T) => string;
};

/**
 * Tabla genérica fuertemente tipada.
 * El borrador de edición usa `Partial<T>` porque el usuario puede no rellenar todos los campos.
 */
export function DataTable<T>({ rows, columns, getRowId }: DataTableProps<T>) {
  const [data, setData] = useState<readonly T[]>(() => [...rows]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<T>>({});

  const iniciarEdicion = (row: T) => {
    const id = getRowId(row);
    setEditingId(id);
    const inicial: Partial<T> = {};
    for (const col of columns) {
      inicial[col.key] = row[col.key];
    }
    setDraft(inicial);
  };

  const cancelar = () => {
    setEditingId(null);
    setDraft({});
  };

  const guardar = () => {
    if (!editingId) return;
    setData((prev) =>
      prev.map((row) => {
        if (getRowId(row) !== editingId) return row;
        return { ...row, ...draft } as T;
      })
    );
    cancelar();
  };

  const onDraftChange = (key: keyof T & string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value as unknown as T[keyof T] }));
  };

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const id = getRowId(row);
            const esEdicion = editingId === id;
            return (
              <tr key={id}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {esEdicion ? (
                      <input
                        aria-label={col.header}
                        value={String(draft[col.key] ?? '')}
                        onChange={(e) => onDraftChange(col.key, e.target.value)}
                      />
                    ) : (
                      String(row[col.key])
                    )}
                  </td>
                ))}
                <td>
                  {esEdicion ? (
                    <>
                      <button type="button" onClick={guardar}>
                        Guardar
                      </button>
                      <button type="button" onClick={cancelar}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => iniciarEdicion(row)}>
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

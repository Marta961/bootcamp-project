import './App.css';
import { DataTable, type DataColumn } from './components/DataTable.tsx';
import { diasEntreFechas } from './utils/fechas.ts';

type Persona = {
  id: string;
  nombre: string;
  ciudad: string;
};

const columnas: readonly DataColumn<Persona>[] = [
  { key: 'id', header: 'ID' },
  { key: 'nombre', header: 'Nombre' },
  { key: 'ciudad', header: 'Ciudad' }
];

const filas: readonly Persona[] = [
  { id: 'p1', nombre: 'Laura', ciudad: 'Valencia' },
  { id: 'p2', nombre: 'Marcos', ciudad: 'Sevilla' }
];

function App() {
  const inicio = new Date('2026-01-10');
  const fin = new Date('2026-01-20');
  const dias = diasEntreFechas(inicio, fin);

  return (
    <main className="app-shell">
      <h1>TaskFlow — laboratorio React + TypeScript</h1>
      <p className="muted">
        Diferencia en días (date-fns): {inicio.toDateString()} → {fin.toDateString()} ={' '}
        <strong>{dias}</strong> días
      </p>

      <section>
        <h2>DataTable genérico</h2>
        <DataTable rows={filas} columns={columnas} getRowId={(p) => p.id} />
      </section>
    </main>
  );
}

export default App;

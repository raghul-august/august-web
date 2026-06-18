import { DOSING_SCHEDULE, type DosingRow } from "@/app/data/tools/glp1-dose-calculator-config";

// Presentational side-by-side titration tables. CSS owned by later agent.
export default function DosingScheduleTables() {
  const sema = DOSING_SCHEDULE.semaglutide;
  const tirz = DOSING_SCHEDULE.tirzepatide;

  return (
    <section className="glp1-dose-schedule">
      <div className="glp1-dose-schedule-grid">
        <ScheduleTable
          title="Semaglutide - weekly titration"
          fullName="Semaglutide weekly titration schedule"
          rows={sema}
        />
        <ScheduleTable
          title="Tirzepatide - weekly titration"
          fullName="Tirzepatide weekly titration schedule"
          rows={tirz}
        />
      </div>
      <p className="glp1-dose-schedule-disclaimer">
        Reference-only titration from the FDA label. Your prescriber may adjust timing based on how you tolerate each step.
      </p>
    </section>
  );
}

interface ScheduleTableProps {
  title: string;
  fullName: string;
  rows: DosingRow[];
}

function ScheduleTable({ title, fullName, rows }: ScheduleTableProps) {
  const notesRows = rows.filter((r) => r.notes);

  return (
    <div className="glp1-dose-table-wrap">
      <h3 className="glp1-dose-table-title">{title}</h3>
      <table className="glp1-dose-table">
        <caption className="sr-only">{fullName}</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            <th scope="col">Dose</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.week}>
              <th scope="row">{r.week}</th>
              <td>{r.dose}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {notesRows.length > 0 && (
        <p className="glp1-dose-table-notes">
          {notesRows.map((r, i) => (
            <span key={r.week}>
              <strong>{r.week}:</strong> {r.notes}
              {i < notesRows.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

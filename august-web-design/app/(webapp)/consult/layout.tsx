import './consult-theme.css';

export default function ConsultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-app="consult" className="consult-theme min-h-screen bg-surface-page">
      {children}
    </div>
  );
}

import "../../website.css";

export function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="website-scope">
      {children}
    </div>
  );
}

import { Link } from 'react-router-dom';

export function NotFound({ what }: { what: string }) {
  return (
    <main className="main">
      <div className="empty empty-top">
        <p>This {what} no longer exists. It may have been removed or restored from a backup.</p>
        <Link to="/" className="btn btn-primary btn-44 btn-pad">
          Back to the map
        </Link>
      </div>
    </main>
  );
}

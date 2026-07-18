import { NavLink, Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            Churn Console<span className="dot"> ●</span>
          </div>
          <nav className="nav">
            <NavLink to="/" end>
              Customers
            </NavLink>
            <NavLink to="/top-churners">Top churners</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

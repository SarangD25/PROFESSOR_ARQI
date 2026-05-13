import "./Main.css";
import { Outlet } from "react-router";
import { Navbar } from "./components/Navbar.jsx";
export function RootComponent() {
    return (<div style={{ minHeight: '100vh', background: 'var(--bg0)', color: 'var(--text1)' }}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>);
}

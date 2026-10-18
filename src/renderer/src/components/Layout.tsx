import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export default function Layout({
  today,
  children
}: {
  today: string;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <div className="brand">ToKnow</div>
          <div className="today-label">{today}</div>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            今日
          </NavLink>
          <NavLink to="/tree">知识树</NavLink>
          <NavLink to="/settings" className="gear" aria-label="设置" title="设置">
            ⚙
          </NavLink>
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { Bootstrap } from '../../shared/ipc';
import type { Profile } from '../../shared/types';
import { api } from './api';
import Layout from './components/Layout';
import CalendarPage from './pages/CalendarPage';
import OnboardingPage from './pages/OnboardingPage';
import SettingsPage from './pages/SettingsPage';
import TodayPage from './pages/TodayPage';
import TreePage from './pages/TreePage';

export default function App() {
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .bootstrap()
      .then(setBoot)
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) {
    return <div className="center-note">启动失败：{error}</div>;
  }
  if (!boot) {
    return <div className="center-note">正在打开今日主线…</div>;
  }
  if (!boot.profile) {
    return (
      <OnboardingPage
        onDone={(profile: Profile) => setBoot({ ...boot, profile })}
      />
    );
  }

  return (
    <Layout today={boot.today}>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tree" element={<TreePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

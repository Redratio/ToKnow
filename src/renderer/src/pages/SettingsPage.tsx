import { useEffect, useState } from 'react';
import type { AppSettings } from '../../../shared/ipc';
import { api } from '../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => setMessage('读取设置失败'));
  }, []);

  async function backup(): Promise<void> {
    setBusy(true);
    setMessage('');
    try {
      const result = await api.exportBackup();
      setMessage(`已导出：${result.jsonPath}`);
    } catch (e) {
      setMessage(`导出失败：${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page narrow">
      <h1>设置</h1>
      <div className="panel">
        <h2>本地数据</h2>
        <p className="muted">所有数据只保存在这台电脑，不会上传。</p>
        <dl className="kv">
          <dt>数据库</dt>
          <dd>{settings?.dbPath ?? '读取中…'}</dd>
          <dt>备份目录</dt>
          <dd>{settings?.backupDir ?? '读取中…'}</dd>
          <dt>版本</dt>
          <dd>{settings?.version ?? '-'}</dd>
        </dl>
        <button className="primary" disabled={busy} onClick={() => void backup()}>
          {busy ? '正在导出…' : '导出备份'}
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const userIdStr = log.user_id ? `U${log.user_id}` : 'Sys';
    return (
      (filterUser === '' || userIdStr.toLowerCase().includes(filterUser.toLowerCase())) &&
      (filterAction === '' || log.action === filterAction)
    );
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User ID', 'Role', 'Action', 'Target Entity', 'Result', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id, l.timestamp, l.userId, l.role, l.action, l.target, l.result, l.ip
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-xl text-center">Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-lg">
        <h1 className="font-display-lg md:text-display-lg text-on-background">Activity Logs</h1>
        <button onClick={handleExportCSV} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-title-card text-title-card flex items-center gap-2 hover:bg-surface-tint transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Export CSV
        </button>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-sm border border-border-subtle p-md mb-lg flex flex-wrap gap-md">
        <div className="flex-1 min-w-[200px]">
          <label className="font-label-caps text-label-caps text-text-secondary uppercase tracking-wider block mb-1 ml-1">Filter by User ID</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
            <input 
              type="text" 
              placeholder="e.g. U003" 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full bg-surface-muted border border-border-subtle rounded-lg py-2 pl-10 pr-4 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-main text-body-main text-on-surface"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="font-label-caps text-label-caps text-text-secondary uppercase tracking-wider block mb-1 ml-1">Filter by Action</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">bolt</span>
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full appearance-none bg-surface-muted border border-border-subtle rounded-lg py-2 pl-10 pr-8 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-main text-body-main text-on-surface"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE_POST">CREATE_POST</option>
              <option value="SUSPEND_USER">SUSPEND_USER</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle font-label-caps text-label-caps text-text-secondary uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Result</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="font-body-main text-body-main text-on-surface font-mono text-sm">
              {filteredLogs.map(log => {
                const isAnomaly = log.result === 'FAILED' || log.action === 'SUSPEND_USER';
                return (
                  <tr key={log.id} className={`border-b border-border-subtle hover:bg-surface-muted transition-colors ${isAnomaly ? 'bg-error/5' : ''}`}>
                    <td className="p-4">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4 font-bold">{log.user_id ? `U${log.user_id}` : 'Sys'}</td>
                    <td className="p-4">{log.role || '-'}</td>
                    <td className="p-4 font-bold">{log.action}</td>
                    <td className="p-4">{log.target || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded font-sans text-xs font-bold ${log.result === 'FAILED' ? 'bg-error/10 text-error' : 'bg-status-success/10 text-status-success'}`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary">{log.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-xl text-center text-text-secondary font-body-main">No logs match your filters.</div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;

import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, postsData, logsData] = await Promise.all([
          api.getUsers(),
          api.getAdminListings(),
          api.getLogs()
        ]);
        setUsers(usersData);
        setPosts(postsData);
        setLogs(logsData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeUsers = users.filter(u => u.status === 'active').length;
  const activePosts = posts.filter(p => p.status === 'active').length;
  const flaggedPosts = posts.filter(p => p.status === 'flagged').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const failedLogins = logs.filter(l => l.result === 'FAILED').length;

  const stats = [
    { title: 'Active Users', value: activeUsers, icon: 'group', color: 'text-primary' },
    { title: 'Active Posts', value: activePosts, icon: 'list_alt', color: 'text-secondary' },
    { title: 'Flagged Posts', value: flaggedPosts, icon: 'flag', color: 'text-error' },
    { title: 'Suspended Users', value: suspendedUsers, icon: 'person_off', color: 'text-error' },
    { title: 'Failed Logins (24h)', value: failedLogins, icon: 'gpp_maybe', color: 'text-error' },
  ];

  if (loading) {
    return <div className="p-xl text-center">Loading Dashboard...</div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="font-display-lg md:text-display-lg text-on-background mb-lg">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-surface-card p-lg rounded-2xl shadow-sm border border-border-subtle flex items-center gap-md">
            <div className={`w-14 h-14 rounded-xl bg-surface-muted flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-[32px]">{stat.icon}</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-text-secondary uppercase tracking-wider">{stat.title}</p>
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-background mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-headline-md text-headline-md text-on-background mb-md">Recent Anomalies</h2>
      <div className="bg-surface-card rounded-2xl shadow-sm border border-border-subtle p-md">
        {logs.filter(l => l.result === 'FAILED' || l.action === 'SUSPEND_USER').map(log => (
          <div key={log.id} className="flex items-center gap-sm p-sm border-b border-border-subtle last:border-0">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <div className="flex-1">
              <p className="font-body-main text-body-main text-on-surface">
                <span className="font-bold">{log.action}</span> for user <span className="font-bold">{log.userId}</span> ({log.result})
              </p>
              <p className="font-body-sm text-body-sm text-text-secondary">{log.timestamp} - IP: {log.ip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

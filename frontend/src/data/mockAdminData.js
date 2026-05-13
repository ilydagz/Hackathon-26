export const mockUsers = [
  { id: 'U001', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joined: '2026-01-15' },
  { id: 'U002', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', joined: '2026-02-10' },
  { id: 'U003', name: 'Suspicious Bot', email: 'bot99@scam.com', role: 'user', status: 'suspended', joined: '2026-05-12' },
  { id: 'U004', name: 'Admin User', email: 'admin@ecovalue.com', role: 'admin', status: 'active', joined: '2025-12-01' },
  { id: 'U005', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'user', status: 'active', joined: '2026-03-22' },
];

export const mockPosts = [
  { id: 'P101', title: 'Vintage Wooden Desk Chair', author: 'John Doe', price: 85, status: 'active', flags: 0, date: '2026-05-10' },
  { id: 'P102', title: 'Sony WH-1000XM4', author: 'Jane Smith', price: 120, status: 'active', flags: 0, date: '2026-05-11' },
  { id: 'P103', title: 'CHEAP IPHONE BUY NOW!!!', author: 'Suspicious Bot', price: 10, status: 'flagged', flags: 5, date: '2026-05-12' },
  { id: 'P104', title: 'Espresso Machine Pro', author: 'Alice Johnson', price: 220, status: 'active', flags: 0, date: '2026-05-13' },
];

export const mockLogs = [
  { id: 'L001', timestamp: '2026-05-13 08:15:22', userId: 'U001', role: 'user', action: 'LOGIN', target: 'System', result: 'SUCCESS', ip: '192.168.1.45' },
  { id: 'L002', timestamp: '2026-05-13 09:30:11', userId: 'U002', role: 'user', action: 'CREATE_POST', target: 'P102', result: 'SUCCESS', ip: '10.0.0.12' },
  { id: 'L003', timestamp: '2026-05-13 11:45:00', userId: 'U003', role: 'user', action: 'LOGIN', target: 'System', result: 'FAILED', ip: '203.0.113.4' },
  { id: 'L004', timestamp: '2026-05-13 11:45:05', userId: 'U003', role: 'user', action: 'LOGIN', target: 'System', result: 'FAILED', ip: '203.0.113.4' },
  { id: 'L005', timestamp: '2026-05-13 11:45:10', userId: 'U003', role: 'user', action: 'LOGIN', target: 'System', result: 'SUCCESS', ip: '203.0.113.4' },
  { id: 'L006', timestamp: '2026-05-13 11:50:22', userId: 'U003', role: 'user', action: 'CREATE_POST', target: 'P103', result: 'SUCCESS', ip: '203.0.113.4' },
  { id: 'L007', timestamp: '2026-05-13 14:20:00', userId: 'U004', role: 'admin', action: 'LOGIN', target: 'System', result: 'SUCCESS', ip: '172.16.0.5' },
  { id: 'L008', timestamp: '2026-05-13 14:25:33', userId: 'U004', role: 'admin', action: 'SUSPEND_USER', target: 'U003', result: 'SUCCESS', ip: '172.16.0.5' },
];

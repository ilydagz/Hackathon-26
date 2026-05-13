import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getAdminListings();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this post?')) {
      try {
        await api.deleteListing(id);
        setPosts(posts.filter(p => p.id !== id));
        alert(`Post ${id} removed.`);
      } catch (err) {
        alert('Failed to remove post');
      }
    }
  };

  if (loading) return <div className="p-xl text-center">Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-lg">
        <h1 className="font-display-lg md:text-display-lg text-on-background">Post Management</h1>
        <div className="bg-surface-muted rounded-lg px-4 py-2 border border-border-subtle flex items-center gap-2 text-on-surface-variant font-body-main">
          <span className="material-symbols-outlined text-[20px]">search</span>
          <input type="text" placeholder="Search posts..." className="bg-transparent border-none focus:ring-0 outline-none w-48" />
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle font-label-caps text-label-caps text-text-secondary uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Price</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status / Flags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-main text-body-main text-on-surface">
              {posts.map(post => (
                <tr key={post.id} className="border-b border-border-subtle hover:bg-surface-muted transition-colors">
                  <td className="p-4 font-title-card text-title-card">{post.id}</td>
                  <td className="p-4">{post.title}</td>
                  <td className="p-4">{post.author ? post.author.name : 'Unknown'}</td>
                  <td className="p-4">${post.selected_price}</td>
                  <td className="p-4">{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold flex inline-flex items-center gap-1 ${post.status === 'flagged' ? 'bg-error/10 text-error' : 'bg-status-success/10 text-status-success'}`}>
                      {post.status === 'flagged' && <span className="material-symbols-outlined text-[14px]">flag</span>}
                      {post.status.toUpperCase()} ({post.flags} flags)
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="text-primary hover:bg-primary-fixed/20 p-2 rounded transition-colors" title="View">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button onClick={() => handleRemove(post.id)} className="text-error hover:bg-error/10 p-2 rounded transition-colors" title="Remove">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="p-xl text-center text-text-secondary font-body-main">No posts found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminPosts;

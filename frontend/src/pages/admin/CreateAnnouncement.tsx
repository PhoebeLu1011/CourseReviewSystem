import React, { useState, useEffect } from 'react';
import type { Announcement, CreateAnnouncementRequest } from '../../models/Announcement';
import { createAnnouncement, getAllAnnouncements, deleteAnnouncement } from '../../api/announcementApi';

const TAGS = ['System', 'Emergency', 'General', 'Event'];

const CreateAnnouncement: React.FC = () => {
  const [formData, setFormData] = useState<CreateAnnouncementRequest>({
    title: '',
    content: '',
    tags: [],
    target: 'all',
    is_pinned: false,
    scheduled_at: '',
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<'form' | 'list'>('form');

  const fetchAnnouncements = async () => {
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAnnouncement(formData);
      alert('公告發布成功！');
      setFormData({ title: '', content: '', tags: [], target: 'all', is_pinned: false, scheduled_at: '' });
      fetchAnnouncements();
      setView('list');
    } catch (error) {
      console.error(error);
      alert('發布失敗，請確認後端是否正常運行');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這則公告嗎？')) return;
    try {
      await deleteAnnouncement(id);
      fetchAnnouncements();
    } catch {
      alert('刪除失敗');
    }
  };

  const toggleTag = (tag: string) => {
    const current = formData.tags || [];
    const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    setFormData({ ...formData, tags: updated });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Announcement Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('form')}
            className={`px-4 py-2 rounded-lg font-medium ${view === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            ＋ 新增公告
          </button>
          <button
            onClick={() => { setView('list'); fetchAnnouncements(); }}
            className={`px-4 py-2 rounded-lg font-medium ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            所有公告 ({announcements.length})
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow p-8 space-y-6">
          {/* 標題 */}
          <div>
            <label className="block text-sm font-medium mb-2">公告標題 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
              placeholder="e.g., 系統維護公告"
              required
            />
          </div>

          {/* 標籤 */}
          <div>
            <label className="block text-sm font-medium mb-2">分類標籤</label>
            <div className="flex gap-2 flex-wrap">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                    formData.tags?.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 內容 */}
          <div>
            <label className="block text-sm font-medium mb-2">公告內容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:border-blue-500 h-40 resize-none"
              placeholder="輸入公告內容..."
              required
            />
          </div>

          {/* 置頂 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pin"
              checked={formData.is_pinned}
              onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="pin" className="text-sm font-medium">📌 置頂公告</label>
          </div>

          {/* 發布按鈕 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 rounded-3xl text-lg transition-colors"
          >
            {isSubmitting ? '發布中...' : '🚀 Publish Announcement'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-16 text-gray-400">目前沒有任何公告</div>
          ) : (
            announcements.map((a) => (
              <div key={a.announcementID} className="bg-white rounded-2xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {a.is_pinned && <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📌 置頂</span>}
                      {(a.tags || []).map(tag => (
                        <span key={tag} className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(a.created_at).toLocaleString('zh-TW')}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.announcementID)}
                    className="ml-4 px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CreateAnnouncement;

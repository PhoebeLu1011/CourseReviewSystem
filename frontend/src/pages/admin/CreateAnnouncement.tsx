import React, { useState } from 'react';

interface Announcement {
  announcementID?: string;
  title: string;
  content: string;
  tags?: string[];
  target: string;
  is_pinned: boolean;
  scheduled_at?: string;
  created_by?: string;
}

const CreateAnnouncement: React.FC = () => {
  const [formData, setFormData] = useState<Announcement>({
    title: '',
    content: '',
    tags: [],
    target: 'all',
    is_pinned: false,
    scheduled_at: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('公告發布成功！');
        // 清空表單
        setFormData({
          title: '',
          content: '',
          tags: [],
          target: 'all',
          is_pinned: false,
          scheduled_at: '',
        });
      } else {
        alert('發布失敗，請檢查後端是否運行');
      }
    } catch (error) {
      console.error(error);
      alert('網路錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Announcement</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow p-8">
        <div className="space-y-6">
          {/* 標題 */}
          <div>
            <label className="block text-sm font-medium mb-2">Announcement Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
              placeholder="e.g., System Maintenance This Weekend"
              required
            />
          </div>

          {/* 標籤 */}
          <div>
            <label className="block text-sm font-medium mb-2">Category Tag</label>
            <div className="flex gap-2">
              {['System', 'Emergency', 'General', 'Event'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const newTags = formData.tags?.includes(tag)
                      ? formData.tags.filter(t => t !== tag)
                      : [...(formData.tags || []), tag];
                    setFormData({ ...formData, tags: newTags });
                  }}
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    formData.tags?.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 內容 */}
          <div>
            <label className="block text-sm font-medium mb-2">Message Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:border-blue-500 h-40"
              placeholder="Write the announcement details here..."
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
            <label htmlFor="pin" className="text-sm font-medium">Pin to Top</label>
          </div>

          {/* 發布按鈕 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 rounded-3xl text-lg transition-colors"
          >
            {isSubmitting ? '發布中...' : '🚀 Publish Announcement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncement;

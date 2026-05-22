import React, { useState } from 'react';
import AuditCenter from './AuditCenter';
import CreateAnnouncement from './CreateAnnouncement';

const AdminLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'audit' | 'announcement'>('audit');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 側邊欄 */}
      <div className="w-64 bg-[#1e2937] text-white p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold">N</div>
          <div>
            <h1 className="font-semibold">Admin Panel</h1>
            <p className="text-xs text-gray-400">NTNU Course System</p>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setCurrentPage('audit')}
            className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 ${currentPage === 'audit' ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
          >
            📋 Audit Center
          </button>
          <button
            onClick={() => setCurrentPage('announcement')}
            className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 ${currentPage === 'announcement' ? 'bg-white text-black' : 'hover:bg-gray-700'}`}
          >
            📢 Announcement Management
          </button>
        </nav>

        <div className="absolute bottom-8 px-4 text-xs text-gray-400">
          <button className="flex items-center gap-2 hover:text-white">
            ← Back to Site
          </button>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="flex-1 overflow-auto">
        {currentPage === 'audit' ? <AuditCenter /> : <CreateAnnouncement />}
      </div>
    </div>
  );
};

export default AdminLayout;

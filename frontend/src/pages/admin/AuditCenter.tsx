import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

interface Report {
  reportID: string;
  reviewID: string;
  reporterID: string;
  reported_type: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'WITHDRAWN';
  timestamp: string;
  handler_id?: string;
  resolution?: string;
}

type TabType = 'PENDING' | 'ALL';

const REASON_LABEL: Record<string, string> = {
  SPAM: '垃圾訊息',
  HARASSMENT: '騷擾',
  OFFENSIVE_CONTENT: '不當內容',
  FALSE_INFORMATION: '錯誤資訊',
  INAPPROPRIATE_LANGUAGE: '不當用語',
  OTHER: '其他',
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-500',
  WITHDRAWN: 'bg-blue-100 text-blue-500',
};

const AuditCenter: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/reports`),
        fetch(`${API_BASE_URL}/admin/reports/all`),
      ]);
      if (!pendingRes.ok || !allRes.ok) throw new Error('Failed to fetch');
      const [pendingData, allData] = await Promise.all([pendingRes.json(), allRes.json()]);
      setReports(pendingData);
      setAllReports(allData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleProcessReport = async (reportID: string, decision: string) => {
    const label = decision === 'DELETE_REVIEW' ? '刪除評價' : decision === 'HIDE_REVIEW' ? '隱藏評價' : '駁回檢舉';
    if (!confirm(`確定要「${label}」嗎？`)) return;

    setProcessingId(reportID);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reports/${reportID}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          handler_id: 'admin_001', // TODO: 改成真實管理員 ID（從 auth context 取）
          resolution: decision === 'DELETE_REVIEW' ? 'deleted' : decision === 'HIDE_REVIEW' ? 'hidden' : 'dismissed',
        }),
      });

      if (res.ok) {
        alert('處理成功！');
        fetchReports();
      } else {
        const err = await res.json();
        alert(`處理失敗：${err.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('網路錯誤');
    } finally {
      setProcessingId(null);
    }
  };

  const displayedReports = activeTab === 'PENDING' ? reports : allReports;
  const resolvedCount = allReports.filter(r => r.status === 'RESOLVED' || r.status === 'DISMISSED').length;

  if (loading) return <div className="p-8 text-gray-500">載入中...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Center</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            待處理 ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            已處理 ({resolvedCount})
          </button>
        </div>
      </div>

      {displayedReports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {activeTab === 'PENDING' ? '目前沒有待處理的檢舉案件' : '尚無已處理案件'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">CASE ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">類型</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">原因</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">檢舉人</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">時間</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">狀態</th>
                {activeTab === 'PENDING' && (
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayedReports.map((report) => (
                <tr key={report.reportID} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {report.reportID.slice(0, 8)}…
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {report.reported_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {REASON_LABEL[report.reason] || report.reason}
                    {report.description && (
                      <p className="text-xs text-gray-400 mt-1">{report.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{report.reporterID}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(report.timestamp).toLocaleString('zh-TW')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_BADGE[report.status] || ''}`}>
                      {report.status}
                    </span>
                    {report.resolution && (
                      <p className="text-xs text-gray-400 mt-1">{report.resolution}</p>
                    )}
                  </td>
                  {activeTab === 'PENDING' && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleProcessReport(report.reportID, 'DELETE_REVIEW')}
                          disabled={processingId === report.reportID}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          刪除評價
                        </button>
                        <button
                          onClick={() => handleProcessReport(report.reportID, 'HIDE_REVIEW')}
                          disabled={processingId === report.reportID}
                          className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                        >
                          隱藏評價
                        </button>
                        <button
                          onClick={() => handleProcessReport(report.reportID, 'DISMISS_REPORT')}
                          disabled={processingId === report.reportID}
                          className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                          駁回
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditCenter;

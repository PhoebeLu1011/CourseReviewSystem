import React, { useState, useEffect } from 'react';

interface Report {
  reportID: string;
  reviewID: string;
  reporterID: string;
  reported_type: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  timestamp: string;
  handler_id?: string;
}

const AuditCenter: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 取得所有待處理檢舉
  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 處理檢舉
  const handleProcessReport = async (reportID: string, decision: string) => {
    if (!confirm(`確定要 ${decision === 'DELETE_REVIEW' ? '刪除評價' : '駁回檢舉'} 嗎？`)) return;

    setProcessingId(reportID);

    try {
      const response = await fetch(`http://localhost:5000/admin/reports/${reportID}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decision,
          handler_id: 'admin_001', // 之後會改成真實管理員 ID
          resolution: decision === 'DELETE_REVIEW' ? 'deleted' : 'dismissed'
        })
      });

      if (response.ok) {
        alert('處理成功！');
        fetchReports(); // 重新載入列表
      } else {
        alert('處理失敗，請稍後再試');
      }
    } catch (error) {
      console.error(error);
      alert('網路錯誤');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8">載入中...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Center</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Pending (3)</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Resolved (0)</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">CASE ID</th>
              <th className="px-6 py-4 text-left">TYPE</th>
              <th className="px-6 py-4 text-left">REASON</th>
              <th className="px-6 py-4 text-left">REPORTER</th>
              <th className="px-6 py-4 text-left">TIMESTAMP</th>
              <th className="px-6 py-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.reportID} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{report.reportID}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {report.reported_type}
                  </span>
                </td>
                <td className="px-6 py-4">{report.reason}</td>
                <td className="px-6 py-4 text-gray-600">{report.reporterID}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(report.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleProcessReport(report.reportID, 'DELETE_REVIEW')}
                      disabled={processingId === report.reportID}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      刪除評價
                    </button>
                    <button
                      onClick={() => handleProcessReport(report.reportID, 'DISMISS_REPORT')}
                      disabled={processingId === report.reportID}
                      className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                      駁回
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditCenter;

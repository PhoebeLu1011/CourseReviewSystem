import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const TYPE_LABEL: Record<string, string> = {
  review: '課程評論',
  comment: '討論回覆',
  teammate_post: '組員招募',
};

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

  // 查看內容 modal
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [reportContent, setReportContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // 編輯 modal（已處理案件）
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editDecision, setEditDecision] = useState('HIDE_REVIEW');

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

  const openContent = async (report: Report) => {
    setViewingReport(report);
    setReportContent(null);
    setContentLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reports/${report.reportID}/content`);
      const data = await res.json();
      setReportContent(res.ok ? data : { error: data.message });
    } catch {
      setReportContent({ error: '無法載入內容' });
    } finally {
      setContentLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingReport) return;
    await handleProcessReport(editingReport.reportID, editDecision);
    setEditingReport(null);
  };

  const displayedReports = activeTab === 'PENDING' ? reports : allReports;
  const resolvedCount = allReports.filter(r => r.status === 'RESOLVED' || r.status === 'DISMISSED').length;

  if (loading) return <div className="p-8 text-gray-500">載入中...</div>;

  return (
    <div className="p-6">
      {/* 編輯 Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditingReport(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-slate-900">編輯處理結果</h3>
              <button onClick={() => setEditingReport(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-xs text-gray-500">目前狀態：<span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[editingReport.status]}`}>{editingReport.status}</span></p>
              <p className="text-sm font-medium text-slate-700">修改為：</p>
              {[
                { value: 'DELETE_REVIEW', label: '刪除評價', desc: '不顯示評論，評分重新計算', color: 'text-red-600' },
                { value: 'HIDE_REVIEW',   label: '隱藏評價', desc: '顯示佔位訊息，評分保留',   color: 'text-orange-500' },
                { value: 'DISMISS_REPORT', label: '駁回檢舉', desc: '評論恢復正常顯示',         color: 'text-gray-600' },
              ].map(opt => (
                <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                  <input
                    type="radio"
                    name="editDecision"
                    value={opt.value}
                    checked={editDecision === opt.value}
                    onChange={() => setEditDecision(opt.value)}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <p className={`text-sm font-semibold ${opt.color}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-2 justify-end">
              <button onClick={() => setEditingReport(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">取消</button>
              <button
                onClick={handleEditSave}
                disabled={processingId === editingReport.reportID}
                className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {processingId === editingReport.reportID ? '處理中...' : '確認修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 被檢舉內容 Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewingReport(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="font-bold text-slate-900">被檢舉內容</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  類型：{TYPE_LABEL[viewingReport.reported_type] || viewingReport.reported_type}
                  　原因：{REASON_LABEL[viewingReport.reason] || viewingReport.reason}
                </p>
              </div>
              <button onClick={() => setViewingReport(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {contentLoading ? (
                <p className="text-center text-gray-400 py-8">載入中...</p>
              ) : reportContent?.error ? (
                <p className="text-rose-500 text-sm">{reportContent.error}</p>
              ) : reportContent?.content ? (
                <div className="space-y-3 text-sm">
                  {/* 評論 */}
                  {reportContent.reported_type === 'review' && (
                    <>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>作者：{reportContent.content.authorID}</span>
                        <span>課程：{reportContent.content.courseID}</span>
                        <span>甜度：{reportContent.content.sweetnessScore} / 工作量：{reportContent.content.workloadScore}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {reportContent.content.content || '（無內容）'}
                      </div>
                    </>
                  )}
                  {/* 討論回覆 */}
                  {reportContent.reported_type === 'comment' && (
                    <>
                      <div className="text-xs text-gray-500">作者：{reportContent.content.authorID}</div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {reportContent.content.content || '（無內容）'}
                      </div>
                    </>
                  )}
                  {/* 組員招募 */}
                  {reportContent.reported_type === 'teammate_post' && (
                    <>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>建立者：{reportContent.content.creator_id}</span>
                        <span>課程：{reportContent.content.course_id}</span>
                      </div>
                      <div className="font-semibold text-slate-800">{reportContent.content.title}</div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {reportContent.content.description || '（無說明）'}
                      </div>
                    </>
                  )}
                  <p className="text-xs text-gray-400">ID：{viewingReport.reported_id || viewingReport.reviewID}</p>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setViewingReport(null)} className="px-4 py-2 rounded-lg bg-slate-200 text-sm font-medium hover:bg-slate-300 transition-colors">關閉</button>
            </div>
          </div>
        </div>
      )}

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
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {displayedReports.map((report) => (
                <tr key={report.reportID} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    <button
                      onClick={() => openContent(report)}
                      className="text-blue-600 hover:underline font-mono"
                      title="查看被檢舉內容"
                    >
                      {report.reportID.slice(0, 8)}…
                    </button>
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
                  <td className="px-6 py-4">
                    {report.status === 'PENDING' ? (
                      <div className="flex gap-2 justify-center flex-wrap">
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
                    ) : (
                      <div className="flex justify-center">
                        <button
                          onClick={() => { setEditingReport(report); setEditDecision('HIDE_REVIEW'); }}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          編輯
                        </button>
                      </div>
                    )}
                  </td>
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

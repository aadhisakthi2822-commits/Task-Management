import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Mail, RefreshCw, ExternalLink, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export const EmailLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/emails?limit=25');
      if (res.data.success) {
        setLogs(res.data.logs);
        if (res.data.logs.length > 0 && !selectedLog) {
          setSelectedLog(res.data.logs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmailLogs();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📧 Email Notification Center & Audit Trail"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
          <p>
            This dashboard displays automated email notifications dispatched by the system for{' '}
            <strong>Task Assignments</strong> and <strong>Status Updates</strong>.
          </p>
          <button
            onClick={fetchEmailLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">Loading email notifications...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No email notifications recorded yet. Assign a task or update a status to generate one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[500px]">
            {/* Logs List */}
            <div className="md:col-span-5 border border-slate-200 rounded-xl overflow-y-auto divide-y divide-slate-100 bg-white">
              {logs.map((log) => {
                const isSelected = selectedLog?._id === log._id;
                return (
                  <div
                    key={log._id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3.5 cursor-pointer transition-colors text-left ${
                      isSelected ? 'bg-indigo-50/90 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          log.triggerEvent === 'TASK_ASSIGNED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.triggerEvent === 'TASK_ASSIGNED' ? 'Task Assigned' : 'Status Updated'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {log.subject}
                    </h4>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span>To: <strong>{log.to}</strong></span>
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          log.status === 'Sent'
                            ? 'text-emerald-600'
                            : log.status === 'Simulated'
                            ? 'text-indigo-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {log.status === 'Sent' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {log.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Email Preview */}
            <div className="md:col-span-7 border border-slate-200 rounded-xl flex flex-col overflow-hidden bg-slate-50">
              {selectedLog ? (
                <>
                  <div className="p-4 bg-white border-b border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{selectedLog.subject}</h4>
                      {selectedLog.previewUrl && (
                        <a
                          href={selectedLog.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Ethereal Preview
                        </a>
                      )}
                    </div>
                    <div className="text-slate-500 flex flex-wrap gap-x-4">
                      <span>From: <strong className="text-slate-700">{selectedLog.from}</strong></span>
                      <span>To: <strong className="text-slate-700">{selectedLog.to}</strong></span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Dispatched on: {new Date(selectedLog.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Rendered HTML preview iframe */}
                  <div className="flex-1 bg-white p-2 overflow-auto">
                    <iframe
                      title="Email Preview"
                      srcDoc={selectedLog.bodyHtml}
                      className="w-full h-full min-h-[340px] border-0 rounded-lg"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </>
              ) : (
                <div className="m-auto text-slate-400 text-xs">Select an email to view preview</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, ShieldCheck, RefreshCw } from 'lucide-react';

export const MonitoringView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [monRes, healthRes] = await Promise.all([
        fetch('/api/monitoring').then(r => r.json()),
        fetch('/api/health').then(r => r.json()),
      ]);
      setData(monRes);
      setHealth(healthRes);
    } catch (err) {
      console.error('Failed to fetch monitoring data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" /> System Metrics & Health Monitoring
          </h1>
          <p className="text-sm text-slate-400">Live API Provider circuit breaker states, latency, and database status</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Server Health</span>
          <div className="text-xl font-bold text-emerald-400 mt-1 uppercase flex items-center gap-1.5">
            <Server className="w-4 h-4" /> {health?.status || 'OK'}
          </div>
          <span className="text-xs text-slate-500">Uptime: {health?.uptimeSeconds || 0}s</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Database Engine</span>
          <div className="text-xl font-bold text-indigo-400 mt-1 flex items-center gap-1.5">
            <Database className="w-4 h-4" /> {health?.database || 'SQLite WAL'}
          </div>
          <span className="text-xs text-slate-500">Local Persistence Active</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Gemini LLM Configured</span>
          <div className={`text-xl font-bold mt-1 flex items-center gap-1.5 ${health?.geminiConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
            <ShieldCheck className="w-4 h-4" /> {health?.geminiConfigured ? 'Live API Key' : 'Demo Mode'}
          </div>
          <span className="text-xs text-slate-500">{health?.geminiConfigured ? 'gemini-3.8-flash' : 'Deterministic Fallback'}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Market Hours Status</span>
          <div className="text-xl font-bold text-blue-400 mt-1">
            {health?.marketStatus?.status || 'OPEN'}
          </div>
          <span className="text-xs text-slate-500">{health?.marketStatus?.session || 'Regular Trading'}</span>
        </div>
      </div>

      {/* Provider Circuit Breaker States */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">API Provider Circuit Breaker Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data?.providers?.map((p: any) => (
            <div key={p.provider} className="p-4 bg-slate-950 border border-slate-800 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-200 uppercase">{p.provider}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${p.isOpen ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {p.isOpen ? 'TRIPPED OPEN' : 'CLOSED (HEALTHY)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Recent Failures: {p.recentFailures}/5 threshold</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent API Usage Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Recent API Request Audit Stream</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Provider</th>
                <th className="p-2">Endpoint</th>
                <th className="p-2">Status</th>
                <th className="p-2">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.apiUsageLogs?.map((log: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-850">
                  <td className="p-2 text-slate-400">{new Date(log.ts).toLocaleTimeString()}</td>
                  <td className="p-2 font-medium text-slate-200">{log.provider}</td>
                  <td className="p-2 text-slate-300">{log.endpoint}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded font-medium ${log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-2 text-slate-300">{log.latencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

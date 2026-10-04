/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Bell, Plus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const [alertList, setAlertList] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [symbol, setSymbol] = useState<string>('RELIANCE.NS');
  const [conditionType, setConditionType] = useState<string>('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState<string>('3000');

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const json = await res.json();
      setAlertList(json.alerts || []);
      setEvents(json.events || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Listen to real-time SSE alerts
    const es = new EventSource('/api/alerts/stream');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvents(prev => [data, ...prev]);
      } catch (e) {}
    };

    return () => {
      es.close();
    };
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, conditionType, targetValue: parseFloat(targetValue) }),
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" /> Real-Time Market Alerts Engine
          </h1>
          <p className="text-sm text-slate-400">Automated price, RSI, volume spike, and cross-indicator monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Alert Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Create Indicator Alert
          </h2>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">NSE Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Condition</label>
              <select
                value={conditionType}
                onChange={e => setConditionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="PRICE_ABOVE">Price Crosses Above</option>
                <option value="PRICE_BELOW">Price Crosses Below</option>
                <option value="RSI_BELOW">RSI(14) Oversold (&lt;30)</option>
                <option value="RSI_ABOVE">RSI(14) Overbought (&gt;70)</option>
                <option value="VOLUME_SPIKE">Volume Spike (&gt;2x 20d avg)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Value</label>
              <input
                type="number"
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded text-sm transition-colors"
            >
              Add Active Alert
            </button>
          </form>
        </div>

        {/* Active Alerts List */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Active Configured Rules
          </h2>
          <div className="space-y-3">
            {alertList.map(item => (
              <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-200">{item.symbol}</span>
                  <span className="ml-3 text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{item.conditionType}</span>
                  <p className="text-xs text-slate-400 mt-1">Target: {item.targetValue}</p>
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded">
                  MONITORING
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Triggered Events Audit */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" /> Live Triggered Events
        </h2>
        <div className="space-y-3">
          {events.map((evt, idx) => (
            <div key={idx} className="p-3 bg-slate-950 border border-amber-900/30 rounded flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{evt.symbol}</span>
                  <span className="text-xs text-slate-500">{new Date(evt.triggeredAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{evt.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

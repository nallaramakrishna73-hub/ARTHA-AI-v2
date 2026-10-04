/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AgentStepTrace } from '../types/index.ts';
import { CheckCircle2, CircleDashed, Loader2, Network, ShieldCheck, Database, Cpu } from 'lucide-react';

interface AgentTimelineProps {
  steps: AgentStepTrace[];
  isStreaming?: boolean;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ steps, isStreaming = false }) => {
  const getNodeIcon = (node: string) => {
    if (node.includes('Planner')) return Network;
    if (node.includes('Data') || node.includes('Market') || node.includes('Fundamental')) return Database;
    if (node.includes('Validator') || node.includes('Compliance')) return ShieldCheck;
    return Cpu;
  };

  return (
    <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#1B2B48]">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#FF9933]" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            LangGraph Agent Execution Pipeline
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {isStreaming ? (
            <span className="flex items-center gap-1.5 text-[#FF9933] font-medium animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Agent Workflow In Progress...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#16A34A] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pipeline Execution Verified
            </span>
          )}
        </div>
      </div>

      {/* Nodes Timeline list */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {steps.map((step, idx) => {
          const Icon = getNodeIcon(step.node);
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';

          return (
            <div
              key={step.id || idx}
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                isRunning
                  ? 'bg-[#070F1F] border-[#FF9933] shadow-[0_0_15px_rgba(255,153,51,0.15)] ring-1 ring-[#FF9933]/50'
                  : isDone
                  ? 'bg-[#070F1F]/60 border-[#1B2B48] hover:border-[#2D436B]'
                  : 'bg-[#070F1F]/30 border-[#1B2B48]/50 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-medium truncate text-white">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isRunning ? 'text-[#FF9933] animate-spin' : isDone ? 'text-[#16A34A]' : 'text-[#64748B]'}`} />
                  <span className="font-mono text-[11px] truncate">{step.node}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {step.latencyMs > 0 && (
                    <span className="text-[10px] text-[#64748B] font-mono-numbers">
                      {step.latencyMs}ms
                    </span>
                  )}
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  ) : isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#FF9933] animate-spin" />
                  ) : (
                    <CircleDashed className="w-3.5 h-3.5 text-[#64748B]" />
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                {step.summary}
              </div>

              {step.evidenceItemsCount !== undefined && (
                <div className="mt-1 text-[10px] text-[#64748B] font-mono-numbers">
                  Evidence points audited: {step.evidenceItemsCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

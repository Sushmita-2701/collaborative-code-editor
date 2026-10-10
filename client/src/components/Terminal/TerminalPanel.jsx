
import React, { useState } from 'react';
import {
  Terminal,
  AlertTriangle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const TerminalPanel = ({
  output,
  isRunning,
  runningLang,
  executionTime,
  onClear,
}) => {
  const [activeTab, setActiveTab] = useState('output');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasErrors = output?.stderr && output.stderr.trim().length > 0;

  return (
    <div
      className={`bg-[#1f1018] border-t border-pink-900/60 flex flex-col transition-all duration-150 ${
        isCollapsed ? 'h-8' : isExpanded ? 'h-96' : 'h-52'
      }`}
    >
      {/* Panel Tab Header */}
      <div className="h-8 shrink-0 bg-[#2d1b26] border-b border-pink-900/50 px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-4 h-full">
          <button
            onClick={() => {
              setActiveTab('output');
              if (isCollapsed) setIsCollapsed(false);
            }}
            className={`h-full flex items-center gap-1.5 text-xs font-medium border-b-2 px-1 transition-colors ${
              activeTab === 'output' && !isCollapsed
                ? 'border-pink-500 text-pink-100'
                : 'border-transparent text-pink-200/50 hover:text-pink-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Output / Terminal
          </button>

          <button
            onClick={() => {
              setActiveTab('problems');
              if (isCollapsed) setIsCollapsed(false);
            }}
            className={`h-full flex items-center gap-1.5 text-xs font-medium border-b-2 px-1 transition-colors ${
              activeTab === 'problems' && !isCollapsed
                ? 'border-pink-500 text-pink-100'
                : 'border-transparent text-pink-200/50 hover:text-pink-200'
            }`}
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                hasErrors ? 'text-rose-400' : ''
              }`}
            />
            Problems {hasErrors ? '(1)' : '(0)'}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-pink-200/50">
          {executionTime !== null && executionTime !== undefined && (
            <span className="flex items-center gap-1 text-[11px] text-pink-200/60 mr-2">
              <Clock className="w-3 h-3" />
              {executionTime}ms
            </span>
          )}

          <button
            onClick={onClear}
            className="p-1 hover:text-pink-300 rounded hover:bg-pink-900/30 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:text-pink-300 rounded hover:bg-pink-900/30 transition-colors"
            title={isExpanded ? 'Restore Size' : 'Maximize Panel'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:text-pink-300 rounded hover:bg-pink-900/30 transition-colors"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Panel Body */}
      {!isCollapsed && (
        <div className="flex-1 min-h-0 p-3 overflow-auto font-mono text-xs select-text bg-[#1f1018] leading-relaxed">
          {isRunning ? (
            <div className="flex items-center gap-2 text-pink-400">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              <span>Running {runningLang}...</span>
            </div>
          ) : activeTab === 'output' ? (
            output ? (
              <div className="space-y-2">
                {output.stdout && (
                  <pre className="text-pink-200 whitespace-pre-wrap">
                    {output.stdout}
                  </pre>
                )}

                {output.stderr && (
                  <div className="text-rose-300 whitespace-pre-wrap bg-rose-950/20 p-2 rounded border border-rose-900/40">
                    {output.stderr}
                  </div>
                )}

                <div className="text-pink-200/50 text-[11px] pt-2 border-t border-pink-900/40 flex items-center justify-between gap-2">
                  <span>
                    Execution completed with exit status:{' '}
                    {output.success ? '0 (Success)' : 'Error'}
                  </span>
                  <span>
                    Duration: {output.executionTime || 0}ms
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-pink-200/40 italic">
                Click "Run" to execute your code inside the isolated Docker sandbox.
              </div>
            )
          ) : (
            /* Problems Tab */
            <div>
              {hasErrors ? (
                <div className="p-2 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300">
                  <span className="font-semibold block mb-1">
                    Execution / Runtime Error:
                  </span>
                  <pre className="whitespace-pre-wrap">
                    {output.stderr}
                  </pre>
                </div>
              ) : (
                <div className="text-pink-200/60">
                  No problems detected in current file.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

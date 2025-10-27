import React from 'react';
import { UserInputAnalysis, TheologianResponse } from '../types';
import { RobotIcon } from './icons/RobotIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface AnalysisResultDisplayProps {
  analysis: UserInputAnalysis | null;
  responses: TheologianResponse[];
  isLoading: boolean;
}

const SourceDisplay: React.FC<{ sources: { title: string; description: string }[] }> = ({ sources }) => (
  <div className="mt-3 border-t border-gray-600/50 pt-3">
    <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center">
      <DocumentTextIcon className="h-4 w-4 mr-1.5" /> Sources
    </h4>
    <ul className="list-none pl-0 space-y-2">
      {sources.map((source, i) => (
        <li key={i} className="text-xs text-gray-300">
          <p className="font-bold">{source.title}</p>
          <p className="text-gray-400">{source.description}</p>
        </li>
      ))}
    </ul>
  </div>
);

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ analysis, responses, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto"></div>
        <p className="mt-4 text-gray-300">Analyzing and gathering responses from theologians...</p>
      </div>
    );
  }

  if (!analysis && responses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">The analysis will appear here. Enter a theological topic above and press "Analyze & Discuss".</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analysis && (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-indigo-400 mb-2">Analysis of Your Input</h3>
          <p className="text-gray-200">{analysis.viewpoint}</p>
          {analysis.sources.length > 0 && <SourceDisplay sources={analysis.sources} />}
        </div>
      )}

      {responses.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-sky-400 mb-4 text-center">Theologian Responses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {responses.map((resp) => (
              <div key={resp.personaName} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col">
                <div className="flex items-center mb-2">
                  <div 
                    className={`h-8 w-8 rounded-full flex-shrink-0 mr-3 flex items-center justify-center`}
                    style={{ backgroundColor: resp.color }}
                  >
                     <RobotIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{resp.personaName}</h4>
                    <p className="text-xs text-gray-400">{resp.denomination}</p>
                  </div>
                </div>
                <div className="text-gray-300 text-sm flex-grow">
                  {resp.responseText.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                </div>
                {resp.sources.length > 0 && <SourceDisplay sources={resp.sources} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
'use client';

/**
 * Taste Brief Generator Component
 * Calls the API and displays the generated taste brief
 */

import { useState } from 'react';
import type { ResearchBrief, TasteBrief } from '@/lib/agent/schema';

interface Props {
  brief: ResearchBrief;
}

export default function TasteBriefGenerator({ brief }: Props) {
  const [generating, setGenerating] = useState(false);
  const [tasteBrief, setTasteBrief] = useState<TasteBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/taste-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate taste brief');
      }

      const result = await response.json();
      setTasteBrief(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* Generate Button */}
      {!tasteBrief && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Generate Taste Brief with Qloo
          </h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Our AI agent will analyze this research brief using Qloo&apos;s cultural intelligence
            APIs to discover audience affinities, trending themes, and generate targeted survey
            questions.
          </p>
          <button
            onClick={generateBrief}
            disabled={generating}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing with Qloo...
              </span>
            ) : (
              'Generate Taste Brief'
            )}
          </button>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Taste Brief Display */}
      {tasteBrief && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Executive Summary
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              {tasteBrief.summary}
            </p>
            <div className="mt-4 flex gap-3 text-sm">
              <span className="px-3 py-1 bg-white rounded-full text-slate-700">
                📊 {tasteBrief.metadata.qloo_entities_analyzed} Qloo entities analyzed
              </span>
              <span className="px-3 py-1 bg-white rounded-full text-slate-700">
                ✓ {Math.round(tasteBrief.metadata.confidence_score * 100)}% confidence
              </span>
            </div>
          </div>

          {/* Audience Profile */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Audience Profile
            </h2>
            <p className="text-slate-700 mb-4">{tasteBrief.audience_profile.description}</p>
            <div className="grid md:grid-cols-2 gap-3">
              {tasteBrief.audience_profile.key_characteristics.map((char, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-slate-700">{char}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Affinities */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Top Brand Affinities
            </h2>
            <div className="space-y-3">
              {tasteBrief.brand_affinities.slice(0, 8).map((affinity, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-slate-900">{affinity.name}</div>
                    <div className="text-sm text-slate-600">
                      {affinity.category} • <span className="font-mono text-xs">{affinity.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{affinity.score}</div>
                      <div className="text-xs text-slate-500">Affinity Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Place Affinities */}
          {tasteBrief.place_affinities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Top Place Affinities
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {tasteBrief.place_affinities.slice(0, 6).map((affinity, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-slate-900">{affinity.name}</div>
                      <div className="text-lg font-bold text-green-600">{affinity.score}</div>
                    </div>
                    <div className="text-sm text-slate-600">{affinity.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Themes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Trending Themes & Values
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tasteBrief.trending_themes.slice(0, 8).map((theme, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                      {theme.tag}
                    </span>
                    <span className="text-sm font-bold text-slate-600">{theme.score}</span>
                  </div>
                  <p className="text-sm text-slate-600">{theme.relevance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Differentiators */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              What Makes This Audience Unique
            </h2>
            <div className="space-y-4">
              {tasteBrief.audience_differentiators.map((diff, i) => (
                <div key={i} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-slate-900">{diff.dimension}</div>
                    <span className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-sm font-bold">
                      +{diff.score} vs baseline
                    </span>
                  </div>
                  <p className="text-slate-700">{diff.insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Positioning Angles */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Recommended Positioning Angles
            </h2>
            <div className="space-y-6">
              {tasteBrief.positioning_angles.map((angle, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{angle.angle}</h3>
                  <p className="text-slate-700 mb-3">{angle.description}</p>
                  <div className="space-y-1">
                    {angle.supporting_data.map((data, j) => (
                      <div key={j} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-blue-500">→</span>
                        <span>{data}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Survey Questions */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Recommended Survey Questions
                </h2>
                <p className="text-slate-600">
                  Data-driven questions optimized for Market Desk surveys
                </p>
              </div>
              <a
                href={`https://circuit-analyst.vercel.app/new?title=${encodeURIComponent(brief.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Send to Market Desk →
              </a>
            </div>
            <div className="space-y-6">
              {tasteBrief.suggested_questions.map((question, i) => (
                <div key={i} className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                          Q{i + 1}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {question.question_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">
                        {question.question}
                      </p>
                      <p className="text-sm text-slate-600 italic mb-3">
                        Rationale: {question.rationale}
                      </p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="text-sm font-semibold text-slate-700">Options:</div>
                          {question.options.map((option, j) => (
                            <div key={j} className="text-sm text-slate-600 pl-4">
                              • {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>
                Generated: {new Date(tasteBrief.generated_at).toLocaleString()}
              </div>
              <div className="flex gap-4">
                {tasteBrief.metadata.data_sources.map((source, i) => (
                  <span key={i} className="text-blue-600">✓ {source}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setTasteBrief(null);
                setError(null);
              }}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Generate New Brief
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(tasteBrief, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `taste-brief-${brief.id}.json`;
                a.click();
              }}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
            >
              Download JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

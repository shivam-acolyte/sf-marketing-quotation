'use client';

import React, { useState, useEffect } from 'react';
import { Plus, HelpCircle, Info } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  questionType: string;
  options: any; // array of strings or null
  required: boolean;
  displayOrder: number;
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Question Form State
  const [questionText, setQuestionText] = useState('');
  const [type, setType] = useState('single_choice');
  const [rawOptions, setRawOptions] = useState(''); // Comma separated options
  const [required, setRequired] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('');

  const loadQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText) return;

    const options = rawOptions
      ? rawOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : null;

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          questionType: type,
          options,
          required,
          displayOrder: displayOrder ? parseInt(displayOrder) : questions.length + 1,
        }),
      });

      if (!res.ok) throw new Error('Create failed');

      setQuestionText('');
      setRawOptions('');
      setDisplayOrder('');
      setShowAddForm(false);
      loadQuestions();
    } catch (err) {
      alert('Failed to create new question.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading questions catalog...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-100">Survey Questions</h1>
          <p className="text-xs text-slate-500">Manage interactive client onboarding survey fields and dropdown options.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Question</span>
        </button>
      </section>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleCreateQuestion} className="glass-panel p-5 rounded-2xl flex flex-col gap-4 bg-slate-900/10">
          <h3 className="text-sm font-bold text-slate-200">Add Survey Question</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-slate-400 font-semibold">Question Text</label>
              <input
                type="text"
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. What is your primary marketing goal?"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Question Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
              >
                <option value="text">Text Input</option>
                <option value="single_choice">Single Choice (Radio)</option>
                <option value="multi_choice">Multiple Choice (Checkbox)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-slate-400 font-semibold">Options (Comma separated list, for choices)</label>
              <input
                type="text"
                value={rawOptions}
                onChange={(e) => setRawOptions(e.target.value)}
                placeholder="e.g. Lead Generation, Brand Awareness, SEO Growth"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
                disabled={type === 'text'}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Order Index</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="e.g. 11"
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Required?</label>
                <select
                  value={String(required)}
                  onChange={(e) => setRequired(e.target.value === 'true')}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-end mt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-800 rounded-xl text-xs text-slate-400 hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs text-white font-semibold shadow-md"
            >
              Add Question
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {questions.map((q) => (
          <div key={q.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex items-start gap-4 bg-slate-900/10">
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 text-xs font-mono font-bold text-slate-400 flex items-center justify-center flex-shrink-0">
              Q{q.displayOrder}
            </div>

            <div className="flex-grow flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="font-bold text-slate-200">{q.question}</h4>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono uppercase">
                  {q.questionType.replace('_', ' ')}
                </span>
                {q.required && (
                  <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold">
                    Required
                  </span>
                )}
              </div>
              
              {q.options && Array.isArray(q.options) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-slate-500 font-semibold text-[10px]">Choices:</span>
                  {q.options.map((opt) => (
                    <span key={opt} className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] text-slate-400">
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

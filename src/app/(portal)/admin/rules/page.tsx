'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react';

interface Service {
  id: number;
  name: string;
}

interface Question {
  id: number;
  question: string;
  options: any;
}

interface Rule {
  id: number;
  serviceId: number;
  condition: {
    field: string;
    operator: string;
    value?: string;
  };
  priority: number;
  active: boolean;
  service: Service;
}

export default function AdminRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Rule Form State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [operator, setOperator] = useState('equals');
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState('1');

  const loadData = async () => {
    try {
      const [rulesRes, servicesRes, questionsRes] = await Promise.all([
        fetch('/api/admin/rules'),
        fetch('/api/services'),
        fetch('/api/questions'),
      ]);

      if (rulesRes.ok) setRules(await rulesRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (questionsRes.ok) setQuestions(await questionsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedQuestionId || !operator) return;

    try {
      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          condition: {
            field: selectedQuestionId,
            operator,
            value: operator !== 'is_empty' && operator !== 'not_empty' ? value : undefined,
          },
          priority: parseInt(priority) || 1,
        }),
      });

      if (!res.ok) throw new Error('Create failed');

      setSelectedServiceId('');
      setSelectedQuestionId('');
      setOperator('equals');
      setValue('');
      setPriority('1');
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert('Failed to create new rule.');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this recommendation rule?')) return;
    try {
      const res = await fetch(`/api/admin/rules/${ruleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      alert('Failed to delete rule.');
    }
  };

  const getHumanReadableCondition = (condition: any) => {
    if (!condition) return 'Invalid Condition';
    const questionObj = questions.find((q) => q.id === Number(condition.field));
    const questionText = questionObj ? questionObj.question : `Question #${condition.field}`;
    
    let opText = '';
    switch (condition.operator) {
      case 'equals': opText = 'is exactly'; break;
      case 'not_equals': opText = 'is not'; break;
      case 'contains': opText = 'contains choice'; break;
      case 'is_empty': opText = 'is blank'; break;
      case 'not_empty': opText = 'is filled'; break;
      default: opText = condition.operator;
    }

    const valueText = condition.value ? ` "${condition.value}"` : '';
    return (
      <span className="text-slate-300">
        IF <strong className="text-cyan-400 font-semibold">{questionText}</strong> {opText} <strong className="text-indigo-300">{valueText}</strong>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading rules engine...</p>
      </div>
    );
  }

  // Find options for currently selected question to help typing value
  const activeQuestionObj = questions.find((q) => q.id === Number(selectedQuestionId));
  const activeQuestionOptions = activeQuestionObj?.options as string[] | null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-100">Recommendation Rules</h1>
          <p className="text-xs text-slate-500">Define logical mapping triggers to recommend services based on client answers.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Rule</span>
        </button>
      </section>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleCreateRule} className="glass-panel p-5 rounded-2xl flex flex-col gap-4 bg-slate-900/10">
          <h3 className="text-sm font-bold text-slate-200">Create Recommendation Rule</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Recommended Service</label>
              <select
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
              >
                <option value="">-- Select Service --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-slate-400 font-semibold">Trigger Question</label>
              <select
                required
                value={selectedQuestionId}
                onChange={(e) => setSelectedQuestionId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
              >
                <option value="">-- Select Question --</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>Q{q.id}: {q.question}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Operator</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Does Not Equal</option>
                <option value="contains">Contains (for checkboxes)</option>
                <option value="is_empty">Is Blank</option>
                <option value="not_empty">Is Filled</option>
              </select>
            </div>

            {operator !== 'is_empty' && operator !== 'not_empty' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Trigger Value</label>
                {activeQuestionOptions ? (
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
                  >
                    <option value="">-- Select Option Choice --</option>
                    {activeQuestionOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. My Website Corp"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200"
                  />
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold">Rule Priority</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="e.g. 1"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none text-slate-200 font-mono"
              />
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
              Add Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="flex flex-col gap-3">
        {rules.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">No recommendation rules found in the database.</p>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-6 bg-slate-900/10">
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-200 uppercase bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">
                    {rule.service.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Priority: {rule.priority}</span>
                </div>
                
                <p className="text-slate-400">{getHumanReadableCondition(rule.condition)}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteRule(rule.id)}
                className="p-2 border border-slate-800 hover:border-rose-500/50 text-slate-500 hover:text-rose-400 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

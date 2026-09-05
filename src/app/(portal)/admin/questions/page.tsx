'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  ArrowLeft,
  CheckCircle2,
  ListOrdered,
  FileQuestion,
  ToggleLeft,
  Sparkles,
  ChevronDown,
  X,
  Check,
  CornerDownRight
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  description?: string | null;
  questionType: string; // 'text' | 'single_choice' | 'multi_choice' | 'yes_no'
  options: any;
  required: boolean;
  page?: number | null;
  displayOrder: number | null;
  hasFollowUp?: boolean;
  followUpTrigger?: string | null;
  followUpText?: string | null;
  active?: boolean;
}

const PAGE_DEFINITIONS = [
  { 
    page: 1, 
    title: 'Page 1: Client Details', 
    desc: 'Business name, city location, AI category detection, industry & salesperson details' 
  },
  { 
    page: 2, 
    title: 'Page 2: Digital Presence', 
    desc: 'Active website, social media, GMB maps with dynamic improvement follow-up buttons' 
  },
  { 
    page: 3, 
    title: 'Page 3: Goals & Budget', 
    desc: 'Tiered marketing priorities (Primary, Secondary, Tertiary) & monthly budget reference' 
  },
];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageTab, setSelectedPageTab] = useState<'all' | number>('all');
  
  // Interactive test preview states for cards (e.g. tracking which Yes/No button is active)
  const [cardAnswers, setCardAnswers] = useState<Record<number, string>>({
    7: 'Yes',
    8: 'Yes',
    9: 'Yes',
  });
  
  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form Fields
  const [questionText, setQuestionText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [type, setType] = useState('yes_no');
  const [rawOptions, setRawOptions] = useState('Yes, No');
  const [targetPage, setTargetPage] = useState<number>(2);
  const [displayOrder, setDisplayOrder] = useState<string>('1');
  const [required, setRequired] = useState(true);
  
  // Conditional Follow-up / Button Reveal fields
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpTrigger, setFollowUpTrigger] = useState('Yes');
  const [followUpText, setFollowUpText] = useState('');

  const [submitting, setSubmitting] = useState(false);

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

  const openAddModal = (defaultPage = 1) => {
    setEditingQuestion(null);
    setQuestionText('');
    setDescriptionText('');
    setType(defaultPage === 2 ? 'yes_no' : 'single_choice');
    setRawOptions(defaultPage === 2 ? 'Yes, No' : '');
    setTargetPage(defaultPage);
    
    // Auto-compute next order for that page
    const pageQuestions = questions.filter(q => (q.page ?? 1) === defaultPage);
    const maxOrder = pageQuestions.reduce((max, q) => Math.max(max, q.displayOrder || 0), 0);
    setDisplayOrder(String(maxOrder + 1));
    
    setHasFollowUp(defaultPage === 2);
    setFollowUpTrigger('Yes');
    setFollowUpText(defaultPage === 2 ? 'Want improvement / Optimization' : '');
    setRequired(true);
    setShowModal(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.question);
    setDescriptionText(q.description || '');
    setType(q.questionType);
    
    const opts = Array.isArray(q.options)
      ? q.options.join(', ')
      : typeof q.options === 'string'
      ? (JSON.parse(q.options || '[]') as string[]).join(', ')
      : '';
    setRawOptions(opts);
    
    setTargetPage(q.page ?? 1);
    setDisplayOrder(String(q.displayOrder ?? 1));
    setRequired(q.required ?? true);
    
    setHasFollowUp(Boolean(q.hasFollowUp));
    setFollowUpTrigger(q.followUpTrigger || 'Yes');
    setFollowUpText(q.followUpText || '');
    setShowModal(true);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType === 'yes_no') {
      setRawOptions('Yes, No');
      setHasFollowUp(true);
      if (!followUpText) setFollowUpText('Want improvement / Redesign');
    } else if (newType === 'text') {
      setRawOptions('');
      setHasFollowUp(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setSubmitting(true);
    const options = type === 'text'
      ? null
      : type === 'yes_no'
      ? ['Yes', 'No']
      : rawOptions
      ? rawOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    const payload = {
      question: questionText.trim(),
      description: descriptionText.trim() || null,
      questionType: type,
      options,
      required,
      page: targetPage,
      displayOrder: parseInt(displayOrder) || 1,
      hasFollowUp,
      followUpTrigger: hasFollowUp ? followUpTrigger : null,
      followUpText: hasFollowUp ? followUpText.trim() : null,
    };

    try {
      if (editingQuestion) {
        // PUT update
        const res = await fetch(`/api/questions/${editingQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        // POST create
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Create failed');
      }

      setShowModal(false);
      await loadQuestions();
    } catch (err) {
      alert('Failed to save survey question.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: number, text: string) => {
    if (!confirm(`Are you sure you want to delete this question?\n"${text}"`)) return;

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await loadQuestions();
    } catch (err) {
      alert('Failed to delete question.');
      console.error(err);
    }
  };

  const handleReorder = async (q: Question, direction: 'up' | 'down') => {
    const currentPage = q.page ?? 1;
    const samePageQuestions = questions
      .filter(item => (item.page ?? 1) === currentPage)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const currentIndex = samePageQuestions.findIndex(item => item.id === q.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= samePageQuestions.length) return;

    const otherQuestion = samePageQuestions[targetIndex];
    const newOrderThis = otherQuestion.displayOrder || targetIndex + 1;
    const newOrderOther = q.displayOrder || currentIndex + 1;

    try {
      await Promise.all([
        fetch(`/api/questions/${q.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayOrder: newOrderThis }),
        }),
        fetch(`/api/questions/${otherQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayOrder: newOrderOther }),
        }),
      ]);
      await loadQuestions();
    } catch (err) {
      console.error('Failed to swap order:', err);
    }
  };

  const handleQuickPageMove = async (q: Question, newPage: number) => {
    if (q.page === newPage) return;
    
    // Find max order in target page
    const targetPageQuestions = questions.filter(item => (item.page ?? 1) === newPage);
    const maxOrder = targetPageQuestions.reduce((max, item) => Math.max(max, item.displayOrder || 0), 0);

    try {
      await fetch(`/api/questions/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: newPage, displayOrder: maxOrder + 1 }),
      });
      await loadQuestions();
    } catch (err) {
      console.error('Failed to move page:', err);
    }
  };

  const toggleInteractiveCardAnswer = (questionId: number, answer: string) => {
    setCardAnswers(prev => ({
      ...prev,
      [questionId]: prev[questionId] === answer ? '' : answer,
    }));
  };

  const getPageCount = (pageNumber: number) => {
    return questions.filter(q => (q.page ?? 1) === pageNumber).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin" />
        <p className="text-slate-500 text-xs font-medium">Loading questionnaire stages & questions...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Hub</span>
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <FileQuestion className="w-6 h-6 text-emerald-600" />
            <span>Survey Questions & Stages</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real quotation questionnaire data synchronized with <strong className="text-slate-800">Page 1, 2, and 3</strong>. Supports <strong className="text-emerald-700">Yes/No options</strong> and <strong className="text-indigo-700">conditional dynamic button reveals</strong>.
          </p>
        </div>

        <button
          onClick={() => openAddModal(typeof selectedPageTab === 'number' ? selectedPageTab : 1)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Question</span>
        </button>
      </div>

      {/* Stage Navigation & Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setSelectedPageTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedPageTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Pages ({questions.length})
        </button>

        {PAGE_DEFINITIONS.map((def) => {
          const count = getPageCount(def.page);
          const isSelected = selectedPageTab === def.page;
          return (
            <button
              key={def.page}
              onClick={() => setSelectedPageTab(def.page)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{def.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area: Grouped or Filtered View */}
      <div className="flex flex-col gap-8">
        {(selectedPageTab === 'all' ? [1, 2, 3] : [selectedPageTab]).map((pageNum) => {
          const pageDef = PAGE_DEFINITIONS.find(d => d.page === pageNum);
          const pageQuestions = questions
            .filter(q => (q.page ?? 1) === pageNum)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          return (
            <section key={pageNum} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              {/* Section Header */}
              <div className="p-4 sm:px-6 sm:py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs">
                    P{pageNum}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>{pageDef?.title || `Page ${pageNum}`}</span>
                      <span className="text-[11px] font-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {pageQuestions.length} {pageQuestions.length === 1 ? 'question' : 'questions'}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">{pageDef?.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => openAddModal(pageNum)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Page {pageNum}</span>
                </button>
              </div>

              {/* Questions List for this page */}
              <div className="divide-y divide-slate-100">
                {pageQuestions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No questions assigned to Page {pageNum} yet. Click "Add to Page {pageNum}" above to create one.
                  </div>
                ) : (
                  pageQuestions.map((q, qIdx) => {
                    const opts = Array.isArray(q.options)
                      ? q.options
                      : typeof q.options === 'string'
                      ? JSON.parse(q.options || '[]')
                      : [];

                    const isFirst = qIdx === 0;
                    const isLast = qIdx === pageQuestions.length - 1;
                    const isYesNo = q.questionType === 'yes_no';
                    const currentAnswer = cardAnswers[q.id] || '';
                    const isFollowUpVisible = q.hasFollowUp && currentAnswer === (q.followUpTrigger || 'Yes');

                    return (
                      <div
                        key={q.id}
                        className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col gap-3"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left Info */}
                          <div className="flex items-start gap-3.5 flex-1">
                            {/* Order index with Up/Down buttons */}
                            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                              <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center font-mono">
                                #{q.displayOrder ?? qIdx + 1}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => handleReorder(q, 'up')}
                                  disabled={isFirst}
                                  title="Move question up"
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleReorder(q, 'down')}
                                  disabled={isLast}
                                  title="Move question down"
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Question details */}
                            <div className="flex flex-col gap-2 flex-1">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-slate-800 text-sm">{q.question}</h3>
                                  
                                  {isYesNo ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 uppercase flex items-center gap-1">
                                      <ToggleLeft className="w-3 h-3" />
                                      <span>YES / NO</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 uppercase">
                                      {q.questionType.replace('_', ' ')}
                                    </span>
                                  )}

                                  {q.required ? (
                                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      Required
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                      Optional
                                    </span>
                                  )}

                                  {q.hasFollowUp && (
                                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                                      <span>Dynamic Reveal Button</span>
                                    </span>
                                  )}
                                </div>

                                {q.description && (
                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-normal">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">Subtext</span>
                                    <span>{q.description}</span>
                                  </p>
                                )}
                              </div>

                              {/* Interactive Yes / No Buttons (Preview & Testing) */}
                              {isYesNo && (
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleInteractiveCardAnswer(q.id, 'Yes')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                                      currentAnswer === 'Yes'
                                        ? 'bg-[#00C49A] text-white border-[#00C49A] shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                                    }`}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleInteractiveCardAnswer(q.id, 'No')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                                      currentAnswer === 'No'
                                        ? 'bg-slate-600 text-white border-slate-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                                    }`}
                                  >
                                    No
                                  </button>
                                  <span className="text-[11px] text-slate-400 italic ml-1">
                                    (Click Yes to test follow-up reveal)
                                  </span>
                                </div>
                              )}

                              {/* Non-Yes/No Options Preview */}
                              {!isYesNo && opts.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {opts.map((opt: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600"
                                    >
                                      {opt}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Actions: Change Page Dropdown + Edit + Delete */}
                          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                            {/* Quick Page Selector */}
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
                              <span className="text-[11px] text-slate-400 font-medium px-1">Page:</span>
                              {[1, 2, 3].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => handleQuickPageMove(q, p)}
                                  className={`w-6 h-6 rounded text-xs font-bold transition-all cursor-pointer ${
                                    (q.page ?? 1) === p
                                      ? 'bg-indigo-600 text-white shadow-2xs'
                                      : 'text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(q)}
                              title="Edit question text, type, page or order"
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteQuestion(q.id, q.question)}
                              title="Delete question"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Dynamic Conditional Follow-up Reveal Area */}
                        {isFollowUpVisible && (
                          <div className="ml-10 mt-1 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                              <CornerDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                Triggered Button
                              </span>
                              <span>{q.followUpText || 'Want improvement / Redesign'}</span>
                            </div>

                            <span className="text-[11px] text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
                              ✓ Appears on "{q.followUpTrigger || 'Yes'}" selection
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingQuestion ? 'Edit Survey Question' : 'Add New Survey Question'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuestion} className="flex flex-col gap-4 text-xs">
              {/* Question Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Question Prompt *</label>
                <input
                  type="text"
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Website: Do they have an active website?"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs transition-colors"
                />
              </div>

              {/* Description / Subtext */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-semibold">Description / Subtext (Optional)</label>
                  <span className="text-[11px] text-slate-400 font-normal">Hindi translation, sub-heading, or hint</span>
                </div>
                <input
                  type="text"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="e.g. Apke business ka naam / Do they have an active website?"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs transition-colors"
                />
              </div>

              {/* Page & Order Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Page / Stage</span>
                  </label>
                  <select
                    value={targetPage}
                    onChange={(e) => {
                      const newP = parseInt(e.target.value);
                      setTargetPage(newP);
                      const pageQ = questions.filter(q => (q.page ?? 1) === newP);
                      const maxOrd = pageQ.reduce((max, q) => Math.max(max, q.displayOrder || 0), 0);
                      setDisplayOrder(String(maxOrd + 1));
                    }}
                    className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value={1}>Page 1 (Client Details & Profile)</option>
                    <option value={2}>Page 2 (Current Digital Presence)</option>
                    <option value={3}>Page 3 (Requirements, Goals & Budget)</option>
                  </select>
                  <span className="text-[10px] text-slate-400">Controls which step this question appears on.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 font-semibold flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Display Order Index</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="e.g. 1, 2, 3..."
                    className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono font-bold focus:border-indigo-500 outline-none transition-colors"
                  />
                  <span className="text-[10px] text-slate-400">Sequence position inside Page {targetPage}.</span>
                </div>
              </div>

              {/* Type & Required */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 font-semibold">Question Type</label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value="yes_no">Yes / No (Boolean Toggle Buttons)</option>
                    <option value="single_choice">Single Choice (Radio Buttons)</option>
                    <option value="multi_choice">Multiple Choice (Checkboxes)</option>
                    <option value="text">Text Input (Short answer)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 font-semibold">Requirement Status</label>
                  <select
                    value={String(required)}
                    onChange={(e) => setRequired(e.target.value === 'true')}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value="true">Mandatory (Required to proceed)</option>
                    <option value="false">Optional (Can be skipped)</option>
                  </select>
                </div>
              </div>

              {/* Options Input (Only for choice types) */}
              {type !== 'text' && type !== 'yes_no' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 font-semibold">
                    Choice Options (Separate with commas)
                  </label>
                  <textarea
                    rows={3}
                    value={rawOptions}
                    onChange={(e) => setRawOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3, Option 4..."
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                  />
                  <span className="text-[10px] text-slate-400">
                    Enter each selectable choice separated by a comma.
                  </span>
                </div>
              )}

              {/* Dynamic Follow-up / Button Reveal Options */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasFollowUp}
                    onChange={(e) => setHasFollowUp(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Enable dynamic follow-up button (Reveal button when clicked)</span>
                  </span>
                </label>

                {hasFollowUp && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-700 font-semibold">Reveal when answer is:</label>
                      <select
                        value={followUpTrigger}
                        onChange={(e) => setFollowUpTrigger(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-slate-700 font-semibold">Follow-up button label / prompt:</label>
                      <input
                        type="text"
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                        placeholder="e.g. Want improvement / Redesign"
                        className="bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

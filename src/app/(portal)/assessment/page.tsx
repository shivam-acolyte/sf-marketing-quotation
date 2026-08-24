'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Mail, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';


interface Question {
  id: number;
  question: string;
  questionType: string;
  options: string[] | null;
  required: boolean;
  displayOrder: number;
}

export default function AssessmentPage() {
  const router = useRouter();
  
  // State Management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Customer Contact State
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  // Questionnaire Answers State (indexed by Question ID)
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // AI Business Type Detection State
  const [portalDesc, setPortalDesc] = useState('');
  const [isPortalDetecting, setIsPortalDetecting] = useState(false);
  const [portalResult, setPortalResult] = useState('');

  // Loading quotes during AI processing
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);
  const loadingQuotes = [
    'Mapping database recommendation rules...',
    'Consulting neural strategy models for target market insights...',
    'Calibrating Complexity Pricing indexes...',
    'Compiling professional strategy brief and PDF structure...',
    'Finalizing details. Almost there...',
  ];

  // Fetch questions on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/api/questions');
        if (!res.ok) throw new Error('Failed to load questions');
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setErrorMsg('Error loading questionnaire. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Rotate loading messages when analysis is running
  useEffect(() => {
    if (!submitting) return;
    const interval = setInterval(() => {
      setLoadingQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [submitting]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading questionnaire parameters...</p>
      </div>
    );
  }

  // Group questions into sections
  // Step 0: Contact Info (Custom Section)
  // Step 1: Business Details (Questions 1, 2, 3, 4)
  // Step 2: Marketing Presence (Questions 5, 6)
  // Step 3: Goals (Question 7)
  // Step 4: Target Audience (Question 8)
  // Step 5: Budget (Question 9)
  // Step 6: Start Date (Question 10)
  const stepsCount = 7;

  // Returns questions for a given step — must be declared BEFORE isStepValid
  const getQuestionsForStep = (step: number): Question[] => {
    if (step === 0) return [];
    const sorted = [...questions].sort((a, b) => a.displayOrder - b.displayOrder);
    if (step === 1) return sorted.filter(q => q.displayOrder >= 1 && q.displayOrder <= 4);
    if (step === 2) return sorted.filter(q => q.displayOrder >= 5 && q.displayOrder <= 6);
    if (step === 3) return sorted.filter(q => q.displayOrder === 7);
    if (step === 4) return sorted.filter(q => q.displayOrder === 8);
    if (step === 5) return sorted.filter(q => q.displayOrder === 9);
    if (step === 6) return sorted.filter(q => q.displayOrder === 10);
    return [];
  };

  // Validation for current step — calls getQuestionsForStep (must be declared after it)
  const isStepValid = () => {
    if (currentStep === 0) {
      return contactInfo.name.trim() !== '' && contactInfo.email.trim() !== '';
    }
    const currentQuestions = getQuestionsForStep(currentStep);
    for (const q of currentQuestions) {
      if (q.required) {
        const answer = answers[String(q.id)];
        if (answer === undefined || answer === null || answer === '') return false;
        if (Array.isArray(answer) && answer.length === 0) return false;
      }
    }
    return true;
  };

  // Navigations
  const handleNext = () => {
    if (!isStepValid()) {
      setErrorMsg('Please complete all required fields before proceeding.');
      return;
    }
    setErrorMsg('');
    if (currentStep < stepsCount - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Update questionnaire answers
  const handleSelectOption = (questionId: number, option: string, isMulti = false) => {
    const key = String(questionId);
    if (isMulti) {
      const currentArr = answers[key] || [];
      if (currentArr.includes(option)) {
        setAnswers(prev => ({
          ...prev,
          [key]: currentArr.filter((o: string) => o !== option),
        }));
      } else {
        setAnswers(prev => ({
          ...prev,
          [key]: [...currentArr, option],
        }));
      }
    } else {
      setAnswers(prev => ({
        ...prev,
        [key]: option,
      }));
    }
  };

  // AI Category Auto-detect for Assessment Portal
  const handlePortalDetect = async (questionId: number) => {
    if (!portalDesc.trim()) return;
    setIsPortalDetecting(true);
    setPortalResult('');
    try {
      const res = await fetch('/api/classify-industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: portalDesc }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.assessmentCategory) {
          handleSelectOption(questionId, data.assessmentCategory, false);
          setPortalResult(data.assessmentCategory);
        }
      }
    } catch (error) {
      console.error('Error auto-detecting business type:', error);
    } finally {
      setIsPortalDetecting(false);
    }
  };

  // Submit and run analysis
  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      // 1. Submit answers to create assessment
      const assessmentRes = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: contactInfo,
          answers: answers,
        }),
      });

      if (!assessmentRes.ok) throw new Error('Failed to submit responses');
      const { assessmentId } = await assessmentRes.json();

      // 2. Trigger AI Engine Analysis
      const analyzeRes = await fetch(`/api/assessments/${assessmentId}/analyze`, {
        method: 'POST',
      });

      if (!analyzeRes.ok) throw new Error('Analysis processing failed');

      // 3. Redirect to Results page
      router.push(`/results?id=${assessmentId}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('An error occurred during strategy compilation. Please try again.');
      setSubmitting(false);
    }
  };

  // Render components
  return (
    <div className="max-w-2xl mx-auto py-4 md:py-8">
      {/* AI Analysis Loading Overlay — pure CSS animations */}
      {submitting && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.96)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <style>{`
            @keyframes radarPulse1 {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.15); opacity: 0.3; }
            }
            @keyframes radarPulse2 {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.25); opacity: 0.2; }
            }
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{ position: 'relative', width: 112, height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.05)',
              animation: 'radarPulse1 2.5s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.05)',
              animation: 'radarPulse2 2.5s ease-in-out infinite 0.8s',
            }} />
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 10px 40px rgba(99,102,241,0.3)',
            }}>
              <Sparkles style={{ width: 32, height: 32, animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
          </div>

          <h2 style={{
            fontSize: '1.5rem', fontWeight: 700,
            background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 12,
          }}>
            Compiling Strategic Marketing Blueprint
          </h2>

          <p key={loadingQuoteIndex} style={{
            color: '#94a3b8', fontSize: '0.875rem', maxWidth: 360,
            lineHeight: 1.6, minHeight: 48,
            animation: 'fadeSlideUp 0.4s ease forwards',
          }}>
            {loadingQuotes[loadingQuoteIndex]}
          </p>
        </div>
      )}

      {/* Main card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-xl border border-white/5 flex flex-col gap-6 relative">
        {/* Step Indicator Headers */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">
              Section {currentStep + 1} of {stepsCount}
            </h2>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              {currentStep === 0 && 'Contact Information'}
              {currentStep === 1 && 'Business Profile'}
              {currentStep === 2 && 'Marketing Presence'}
              {currentStep === 3 && 'Marketing Objectives'}
              {currentStep === 4 && 'Target Demographics'}
              {currentStep === 5 && 'Investment Scope'}
              {currentStep === 6 && 'Project Timeline'}
            </h3>
          </div>
          <span className="text-sm font-mono text-slate-500">
            {Math.round(((currentStep) / (stepsCount - 1)) * 100)}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / (stepsCount - 1)) * 100}%` }}
          />
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Form Inputs Container */}
        <div className="min-h-[250px] py-2">
          {/* STEP 0: Contact Info */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-5">
              <p className="text-slate-400 text-xs leading-relaxed">
                Provide your contact details so we can draft and email your proposal.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Corporate Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="e.g. jane@company.com"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactInfo.company}
                    onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC STEPS (1-6) */}
          {currentStep > 0 && getQuestionsForStep(currentStep).map((q) => {
            const answer = answers[String(q.id)];
            
            return (
              <div key={q.id} className="flex flex-col gap-4 mb-6 last:mb-0">
                <h4 className="text-sm font-semibold text-slate-200 flex items-start gap-1">
                  {q.question}
                  {q.required && <span className="text-rose-500">*</span>}
                </h4>

                {/* Question Type: TEXT */}
                {q.questionType === 'text' && (
                  <input
                    type="text"
                    value={answer || ''}
                    onChange={(e) => setAnswers({ ...answers, [String(q.id)]: e.target.value })}
                    placeholder="Provide your answer..."
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-colors"
                  />
                )}

                {/* Question Type: SINGLE CHOICE */}
                {q.questionType === 'single_choice' && q.options && (
                  <div className="flex flex-col gap-4 w-full">
                    {/* Add AI Category Finder if this is the "type of business" question */}
                    {q.question.toLowerCase().includes('type of business') && (
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 flex flex-col gap-3">
                        <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                          <span>AI Business Type Assistant</span>
                          <span className="text-[10px] font-normal text-slate-500">Auto-detect from Hinglish/English description</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={portalDesc}
                            onChange={(e) => setPortalDesc(e.target.value)}
                            placeholder="e.g. ye biscuit ki company hai, ya online clothes sell karte hai"
                            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => handlePortalDetect(q.id)}
                            disabled={isPortalDetecting || !portalDesc.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 min-w-[100px] justify-center"
                          >
                            {isPortalDetecting ? (
                              <>
                                <span className="w-3 h-3 rounded-full border-t border-r border-white animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                                Detect
                              </>
                            )}
                          </button>
                        </div>
                        {portalResult && (
                          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Auto-selected: <strong>{portalResult}</strong>
                          </p>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt) => {
                        const isSelected = answer === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt, false)}
                            className={`text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                              isSelected 
                                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/5' 
                                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Type: MULTI CHOICE */}
                {q.questionType === 'multi_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt) => {
                      const isSelected = Array.isArray(answer) && answer.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt, true)}
                          className={`text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-orange-950/20 border-orange-500 text-orange-300 shadow-md shadow-orange-500/5' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all ${
              currentStep === 0 
                ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed' 
                : 'border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:scale-[1.02]"
          >
            <span>{currentStep === stepsCount - 1 ? 'Analyze Details' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

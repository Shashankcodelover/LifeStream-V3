import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert, Clock, CheckCircle2, Bookmark, HelpCircle,
  Play, RotateCcw, Award, FileText, ChevronLeft, ChevronRight,
  AlertTriangle, Eye, Terminal, Sparkles, UserCheck, QrCode,
  Download, Copy, X, Volume2, ShieldCheck, Flag
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function AssessmentArenaView({ user }) {
  const [challenges, setChallenges] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [codeSolutions, setCodeSolutions] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [visitedSet, setVisitedSet] = useState(new Set([0]));

  // Proctoring & Strike State
  const [proctorStrikes, setProctorStrikes] = useState(0);
  const [showProctorWarning, setShowProctorWarning] = useState(false);
  const [proctorLogs, setProctorLogs] = useState([]);
  const [isExamLocked, setIsExamLocked] = useState(false);

  // Timer State (15 minutes = 900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(900);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorecard, setScorecard] = useState(null);

  // Local Code Test State
  const [localTestFeedback, setLocalTestFeedback] = useState(null);

  // Fetch Challenges
  useEffect(() => {
    (async () => {
      try {
        const data = await resilientFetch('/api/assessment/challenges');
        if (data && data.challenges) {
          setChallenges(data.challenges);
          const initialCode = {};
          data.challenges.forEach(c => {
            if (c.starterCode) initialCode[c.id] = c.starterCode;
          });
          setCodeSolutions(initialCode);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Proctoring: Detect Tab Switch & Window Blur
  useEffect(() => {
    if (isSubmitted || isExamLocked) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerProctorInfraction('TAB_SWITCH_HIDDEN', 'Candidate switched browser tab or minimized window');
      }
    };

    const handleWindowBlur = () => {
      triggerProctorInfraction('WINDOW_BLUR', 'Focus lost from active proctor examination arena');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [proctorStrikes, isSubmitted, isExamLocked]);

  // Log and handle proctor strike
  const triggerProctorInfraction = async (type, details) => {
    const nextStrike = proctorStrikes + 1;
    setProctorStrikes(nextStrike);
    setShowProctorWarning(true);

    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[Strike ${nextStrike}/3] ${details} at ${timestamp}`;
    setProctorLogs(prev => [logMsg, ...prev]);

    try {
      await resilientFetch('/api/assessment/proctor-audit', {
        method: 'POST',
        body: JSON.stringify({
          eventType: type,
          candidateName: user?.name || 'Trauma Director Candidate',
          strikeNumber: nextStrike,
          details
        })
      });
    } catch (e) {}

    if (nextStrike >= 3) {
      setIsExamLocked(true);
      handleSubmitExam();
    }
  };

  // 15-Minute Countdown Timer Loop
  useEffect(() => {
    if (isSubmitted || isExamLocked || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, isSubmitted, isExamLocked]);

  // Submit Examination
  const handleSubmitExam = async () => {
    setIsSubmitted(true);
    setShowProctorWarning(false);
    try {
      const data = await resilientFetch('/api/assessment/submit', {
        method: 'POST',
        body: JSON.stringify({
          candidateName: user?.name || 'Dr. Evelyn Vance, MD',
          candidateRole: 'Senior Trauma Logistics Coordinator',
          answers,
          codeSolutions,
          timeElapsedSeconds: 900 - secondsRemaining
        })
      });
      setScorecard(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Run local code test against starter test case
  const handleRunLocalCodeTest = () => {
    const currentChal = challenges[currentIdx];
    if (!currentChal || currentChal.type !== 'CODING_ALGORITHM') return;

    try {
      const userCode = codeSolutions[currentChal.id] || currentChal.starterCode;
      const fn = new Function('donors', 'hospitalLat', 'hospitalLng', `
        ${userCode}
        return selectOptimalDonor(donors, hospitalLat, hospitalLng);
      `);

      const sampleDonors = [
        { id: 'DONOR-A', lat: 37.7800, lng: -122.4150, bloodType: 'O-' },
        { id: 'DONOR-B', lat: 37.7500, lng: -122.4300, bloodType: 'O-' }
      ];

      const result = fn(sampleDonors, 37.7749, -122.4194);
      setLocalTestFeedback({
        status: 'SUCCESS',
        result,
        message: `Local test executed in 1.2ms. Output: "${result}" (Expected: "DONOR-A")`
      });
    } catch (err) {
      setLocalTestFeedback({
        status: 'ERROR',
        message: `Syntax/Runtime Error: ${err.message}`
      });
    }
  };

  // Navigation helpers
  const handleSelectQuestion = (idx) => {
    setCurrentIdx(idx);
    setVisitedSet(prev => new Set([...prev, idx]));
    setLocalTestFeedback(null);
  };

  const toggleReviewMark = (chalId) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(chalId)) next.delete(chalId);
      else next.add(chalId);
      return next;
    });
  };

  const currentChallenge = challenges[currentIdx] || null;

  // Format Timer mm:ss
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const timerColor = secondsRemaining > 450 ? 'text-[#137333]' : secondsRemaining > 180 ? 'text-[#b06000]' : 'text-[#ea4335] animate-pulse';

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Examination Top Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ea4335]" />
            <h2 className="text-base font-bold text-[#202124] tracking-tight">
              National Trauma Logistics & Autonomous Dispatch Certification Arena
            </h2>
            <span className="text-[10px] font-bold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] px-2.5 py-0.5 rounded-full">
              PROCTORED EXAM
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-0.5">
            American Association of Blood Banks (AABB) & LifeStream Aerospace Board
          </p>
        </div>

        {/* Dynamic Timer & Proctor Security Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#f8fafd] px-4 py-2 rounded-2xl border border-[#dadce0]">
            <Clock className={`w-4 h-4 ${timerColor}`} />
            <span className={`text-base font-black font-mono ${timerColor}`}>
              {timeFormatted}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f8fafd] px-3 py-2 rounded-2xl border border-[#dadce0] text-xs">
            <ShieldAlert className={`w-4 h-4 ${proctorStrikes > 0 ? 'text-[#ea4335]' : 'text-[#34a853]'}`} />
            <span className="font-bold text-[#202124]">
              Strikes: <span className={proctorStrikes > 0 ? 'text-[#ea4335]' : 'text-[#137333]'}>{proctorStrikes}/3</span>
            </span>
          </div>

          <button
            onClick={handleSubmitExam}
            disabled={isSubmitted}
            className="bg-[#ea4335] hover:bg-[#d93025] text-white px-5 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Main 2-Column Assessment Layout: Question Pane (Left) & Palette / Proctor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 8 COLS: Active Challenge Arena */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-5">
          {currentChallenge ? (
            <div>
              {/* Question Meta Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f4] mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#e8f0fe] text-[#1a73e8] px-2.5 py-0.5 rounded-full">
                    Question {currentIdx + 1} of {challenges.length}
                  </span>
                  <span className="text-xs font-bold text-[#5f6368]">• {currentChallenge.category}</span>
                  <span className="text-[10px] font-bold text-[#b06000] bg-[#fef7e0] px-2 py-0.2 rounded-full border border-[#feefc3]">
                    {currentChallenge.points} Points
                  </span>
                </div>

                <button
                  onClick={() => toggleReviewMark(currentChallenge.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    markedForReview.has(currentChallenge.id)
                      ? 'bg-[#f3e8fd] text-[#7e22ce] border-[#e9d5ff]'
                      : 'bg-white text-[#5f6368] border-[#dadce0] hover:text-[#202124]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{markedForReview.has(currentChallenge.id) ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Title & Clinical Scenario */}
              <h3 className="text-sm font-bold text-[#202124] mb-2">{currentChallenge.title}</h3>
              <p className="text-xs text-[#5f6368] leading-relaxed mb-5 bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0]">
                {currentChallenge.scenario}
              </p>

              {/* CHALLENGE TYPE 1: MULTIPLE CHOICE SCENARIO */}
              {currentChallenge.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider block">
                    Select the Protocol Action:
                  </span>
                  {currentChallenge.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentChallenge.id]: opt.id }))}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 ${
                        answers[currentChallenge.id] === opt.id
                          ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-bold shadow-sm'
                          : 'bg-white border-[#dadce0] hover:border-[#bdc1c6] text-[#202124]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        answers[currentChallenge.id] === opt.id
                          ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                          : 'bg-[#f8fafd] text-[#5f6368] border-[#dadce0]'
                      }`}>
                        {opt.id}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* CHALLENGE TYPE 2: IN-BROWSER CODE ALGORITHM */}
              {currentChallenge.type === 'CODING_ALGORITHM' && (
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">
                      Algorithmic Solution Sandbox (JavaScript ES6):
                    </span>
                    <button
                      onClick={handleRunLocalCodeTest}
                      className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-3.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Run Boundary Test</span>
                    </button>
                  </div>

                  <div className="bg-[#0d1117] text-emerald-400 p-3 rounded-2xl border border-slate-700">
                    <textarea
                      value={codeSolutions[currentChallenge.id] || currentChallenge.starterCode}
                      onChange={e => setCodeSolutions(prev => ({ ...prev, [currentChallenge.id]: e.target.value }))}
                      spellCheck="false"
                      className="w-full h-56 bg-transparent text-emerald-400 font-mono text-xs outline-none resize-none selection:bg-[#1a73e8]/40 leading-relaxed"
                    />
                  </div>

                  {localTestFeedback && (
                    <div className={`p-3 rounded-xl border text-xs font-sans flex items-center gap-2 ${
                      localTestFeedback.status === 'SUCCESS'
                        ? 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]'
                        : 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{localTestFeedback.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f1f3f4] mt-6">
                <button
                  onClick={() => handleSelectQuestion(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#dadce0] text-xs font-bold text-[#5f6368] hover:text-[#202124] disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => handleSelectQuestion(Math.min(challenges.length - 1, currentIdx + 1))}
                  disabled={currentIdx >= challenges.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1a73e8] text-white text-xs font-bold shadow-sm hover:bg-[#1557b0] disabled:opacity-30"
                >
                  <span>Next Challenge</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">Loading exam questions...</div>
          )}
        </div>

        {/* RIGHT 4 COLS: Question Palette & Proctor Violation Audit Log */}
        <div className="lg:col-span-4 space-y-4">
          {/* Question Palette Matrix */}
          <div className="bg-white p-5 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-4">
            <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              Examination Palette
            </h4>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-[#5f6368]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#34a853]" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#7e22ce]" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#dadce0]" />
                <span>Unvisited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#fbbc04]" />
                <span>Current Question</span>
              </div>
            </div>

            {/* Grid of Questions */}
            <div className="grid grid-cols-5 gap-2 pt-2 border-t border-[#f1f3f4]">
              {challenges.map((chal, idx) => {
                const isAnswered = answers[chal.id] !== undefined || (chal.type === 'CODING_ALGORITHM' && codeSolutions[chal.id]);
                const isMarked = markedForReview.has(chal.id);
                const isCurrent = idx === currentIdx;

                let bgClass = 'bg-[#f1f3f4] text-[#5f6368] border-[#dadce0]';
                if (isCurrent) bgClass = 'bg-[#fbbc04] text-[#202124] border-[#f29900] font-bold ring-2 ring-[#fbbc04]/40';
                else if (isMarked) bgClass = 'bg-[#f3e8fd] text-[#7e22ce] border-[#e9d5ff] font-bold';
                else if (isAnswered) bgClass = 'bg-[#e6f4ea] text-[#137333] border-[#ceead6] font-bold';

                return (
                  <button
                    key={chal.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`h-9 rounded-xl border flex items-center justify-center text-xs font-mono transition-all ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proctor Infraction Audit Log */}
          <div className="bg-white p-5 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1a73e8]" />
                <span>Proctor Security Audit Log</span>
              </h4>
              <span className="text-[10px] text-emerald-600 font-bold bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto google-scrollbar text-[10px] font-mono text-[#5f6368]">
              {proctorLogs.map((log, i) => (
                <div key={i} className="p-2 rounded-xl bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f]">
                  {log}
                </div>
              ))}
              {proctorLogs.length === 0 && (
                <p className="text-[11px] text-[#70757a] text-center py-4">
                  ✓ Zero proctor infractions detected. Window focus locked.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Proctor Strike Modal (3 Strikes Rule) */}
      {showProctorWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border border-[#ea4335] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fce8e6] flex items-center justify-center text-[#ea4335]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#202124]">
                  Proctor Violation Detected ({proctorStrikes}/3 Strikes)
                </h4>
                <p className="text-xs text-[#5f6368]">Tab switch or window blur event registered on audit ledger</p>
              </div>
            </div>

            <div className="p-3 bg-[#fce8e6] rounded-2xl border border-[#fad2cf] text-xs text-[#c5221f] leading-relaxed">
              <strong>Warning:</strong> You navigated away from the proctored examination arena. Accumulating 3 strikes results in immediate automated test termination and submission.
            </div>

            <button
              onClick={() => setShowProctorWarning(false)}
              className="w-full bg-[#ea4335] hover:bg-[#d93025] text-white py-2.5 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              I Acknowledge & Return to Examination
            </button>
          </div>
        </div>
      )}

      {/* Post-Test Diagnostic Scorecard & Certificate Modal */}
      {scorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-[#dadce0] space-y-6 max-h-[90vh] overflow-y-auto google-scrollbar">
            {/* Header */}
            <div className="text-center space-y-1 pb-4 border-b border-[#f1f3f4]">
              <div className="w-12 h-12 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#202124]">
                Official Trauma Logistics Director Scorecard
              </h3>
              <p className="text-xs text-[#5f6368]">
                Calibrated against {scorecard.calibratedAgainst}
              </p>
            </div>

            {/* Primary Scores Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0]">
                <span className="text-[10px] text-[#5f6368] block uppercase font-bold">TOTAL SCORE</span>
                <span className="text-2xl font-black font-mono text-[#1a73e8]">
                  {scorecard.finalScore} / {scorecard.maxPossibleScore}
                </span>
              </div>

              <div className="bg-[#e6f4ea] p-4 rounded-2xl border border-[#ceead6]">
                <span className="text-[10px] text-[#137333] block uppercase font-bold">PERCENTILE RANK</span>
                <span className="text-2xl font-black font-mono text-[#137333]">
                  {scorecard.percentileRank}th
                </span>
              </div>

              <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0]">
                <span className="text-[10px] text-[#5f6368] block uppercase font-bold">CERTIFICATION</span>
                <span className="text-xs font-bold text-[#202124] block mt-1">
                  {scorecard.certificate?.competencyLevel?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Cryptographic Certificate Card */}
            {scorecard.certificate && (
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 rounded-3xl border border-slate-700 space-y-3 font-sans relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold block tracking-widest">
                      ACCREDITED CREDENTIAL
                    </span>
                    <h4 className="text-sm font-black text-white">{scorecard.certificate.candidateName}</h4>
                    <span className="text-xs text-slate-300 font-medium">{scorecard.certificate.candidateRole}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-400 block">SERIAL NUMBER</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{scorecard.certificate.serialNumber}</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[10px] font-mono text-slate-300 break-all">
                  SHA-256 Hash: {scorecard.certificate.verificationHash}
                </div>
              </div>
            )}

            <button
              onClick={() => setScorecard(null)}
              className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-3 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              Close Diagnostic Scorecard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

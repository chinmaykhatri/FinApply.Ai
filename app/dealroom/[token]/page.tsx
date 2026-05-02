'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PillButton from '@/components/ui/PillButton';
import Modal from '@/components/ui/Modal';
import { assignCase } from '@/lib/cases';
import type { DealCase } from '@/lib/cases';

const TOTAL_TIME = 90 * 60; // 90 minutes in seconds
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const PRACTICE_TIME = 10 * 60; // 10 minutes
const MAX_TAB_VIOLATIONS = 3; // Auto-submit after 3 tab switches

const GUIDE_TABS = [
  {
    id: 'valuation',
    label: 'Valuation',
    hint: 'Build a DCF or comparable multiples analysis. State your WACC, terminal growth rate, and key assumptions. Cross-verify with at least one alternate method.',
  },
  {
    id: 'risk',
    label: 'Risk Analysis',
    hint: 'Identify the top 3 risks from the case data. For each, explain the probability, potential impact on valuation, and a concrete mitigation strategy.',
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    hint: 'State your investment decision clearly in the first sentence. Then defend it with 2-3 conditions, each with a measurable threshold.',
  },
  {
    id: 'growth',
    label: 'Growth Assessment',
    hint: 'Evaluate revenue quality — organic vs inorganic growth, customer concentration, pricing power, and sustainability of margin expansion.',
  },
];

export default function DealRoomPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [phase, setPhase] = useState<'loading' | 'invalid' | 'instructions' | 'warmup' | 'active' | 'submitted'>('loading');
  const [applicationId, setApplicationId] = useState<string>('');
  const [candidateName, setCandidateName] = useState<string>('');
  const [activeCase, setActiveCase] = useState<DealCase | null>(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [content, setContent] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChangeCaseModal, setShowChangeCaseModal] = useState(false);
  const [caseChangeUsed, setCaseChangeUsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('valuation');
  const [lastSaved, setLastSaved] = useState<string>('');
  const [saveError, setSaveError] = useState(false);
  const [practiceContent, setPracticeContent] = useState('');
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(PRACTICE_TIME);
  // Proctoring state
  const [tabViolations, setTabViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState(false);
  const [proctorReady, setProcterReady] = useState(false);
  const startedAt = useRef<string>('');
  const targetRoleRef = useRef<string>('Investment Banking Analyst');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const alertPlayedRef = useRef(false);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const violationLog = useRef<Array<{type: string; time: string}>>([]);
  const autoSubmitRef = useRef<() => void>(() => {});

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/dealroom/${token}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setApplicationId(json.data.id);
          setCandidateName(json.data.full_name);

          // Store target role and assign a random case from that track
          const targetRole = json.data.target_role || 'Investment Banking Analyst';
          targetRoleRef.current = targetRole;
          const assigned = assignCase(targetRole);
          setActiveCase(assigned);

          // Check if already submitted
          if (json.data.simulations && json.data.simulations.length > 0) {
            setPhase('submitted');
          } else {
            setPhase('instructions');
          }
        } else {
          setPhase('invalid');
        }
      } catch {
        setPhase('invalid');
      }
    }
    if (token) validateToken();
  }, [token]);

  // Session recovery from localStorage
  useEffect(() => {
    if (phase !== 'active' || !token) return;
    const savedSession = localStorage.getItem(`finapply_session_${token}`);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.content && !content) {
          setContent(session.content);
          if (session.timeLeft) setTimeLeft(session.timeLeft);
          if (session.startedAt) startedAt.current = session.startedAt;
          if (session.caseCode && activeCase?.code !== session.caseCode) {
            // Case mismatch, don't restore content
          }
        }
      } catch { /* ignore corrupt data */ }
    }
  }, [phase, token]);

  // Auto-save to localStorage
  useEffect(() => {
    if (phase !== 'active' || !token) return;
    const interval = setInterval(() => {
      try {
        localStorage.setItem(`finapply_session_${token}`, JSON.stringify({
          content,
          timeLeft,
          startedAt: startedAt.current,
          caseCode: activeCase?.code,
          savedAt: new Date().toISOString(),
        }));
        setLastSaved(new Date().toLocaleTimeString());
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [phase, content, timeLeft, token, activeCase]);

  // Timer
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleAutoSubmit();
          return 0;
        }
        // Audio alert at 5 minutes remaining
        if (t === 300 && !alertPlayedRef.current) {
          alertPlayedRef.current = true;
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch { /* Audio not available */ }
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // ── PROCTORING: Tab/Window switch detection ──
  useEffect(() => {
    if (phase !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const violation = { type: 'tab_switch', time: new Date().toISOString() };
        violationLog.current.push(violation);
        setTabViolations(prev => {
          const next = prev + 1;
          setShowViolationWarning(true);
          if (next >= MAX_TAB_VIOLATIONS) {
            // Auto-submit on max violations
            setTimeout(() => autoSubmitRef.current(), 500);
          }
          return next;
        });
      }
    };

    const handleBlur = () => {
      if (phase === 'active') {
        violationLog.current.push({ type: 'window_blur', time: new Date().toISOString() });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase]);

  // ── PROCTORING: Prevent page close ──
  useEffect(() => {
    if (phase !== 'active') return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  // ── PROCTORING: Fullscreen detection ──
  useEffect(() => {
    if (phase !== 'active') return;
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull && phase === 'active') {
        violationLog.current.push({ type: 'fullscreen_exit', time: new Date().toISOString() });
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [phase]);

  // ── PROCTORING: Webcam init ──
  const initWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 160, height: 120, facingMode: 'user' },
        audio: false,
      });
      setWebcamStream(stream);
      setWebcamError(false);
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch {
      setWebcamError(true);
      // Camera denied — still allow exam but log it
      violationLog.current.push({ type: 'camera_denied', time: new Date().toISOString() });
    }
  }, []);

  // Attach stream to video element when ref is available
  useEffect(() => {
    if (webcamRef.current && webcamStream) {
      webcamRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Cleanup webcam on unmount or phase change
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [webcamStream]);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  // Practice warm-up timer
  useEffect(() => {
    if (phase !== 'warmup') return;
    const interval = setInterval(() => {
      setPracticeTimeLeft((t) => {
        if (t <= 1) {
          setPhase('instructions');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const getTimerColor = () => {
    if (timeLeft <= 300) return '#DC2626';
    if (timeLeft <= 900) return '#D97706';
    return '#fff';
  };

  const handleStart = async () => {
    startedAt.current = new Date().toISOString();
    // Initialize proctoring
    await initWebcam();
    await enterFullscreen();
    setProcterReady(true);
    setPhase('active');
    setTimeout(() => textAreaRef.current?.focus(), 200);
  };

  const handleStartPractice = () => {
    setPracticeContent('');
    setPracticeTimeLeft(PRACTICE_TIME);
    setPhase('warmup');
  };

  const handleSkipPractice = () => {
    setPhase('instructions');
  };

  const handleChangeCase = () => {
    const newCase = assignCase(targetRoleRef.current);
    setActiveCase(newCase);
    setContent('');
    setCaseChangeUsed(true);
    setShowChangeCaseModal(false);
  };

  const handleExit = () => {
    setShowExitModal(false);
    router.push('/');
  };

  const handleAutoSubmit = useCallback(async () => {
    setSubmitting(true);
    let retries = 3;
    let success = false;
    while (retries > 0 && !success) {
      try {
        const res = await fetch('/api/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            application_id: applicationId,
            case_code: activeCase?.code || 'UNKNOWN',
            content,
            word_count: wordCount,
            time_taken_seconds: TOTAL_TIME - timeLeft,
            started_at: startedAt.current,
            tab_violations: tabViolations,
            violation_log: violationLog.current,
          }),
        });
        if (res.ok) success = true;
        else retries--;
      } catch {
        retries--;
        if (retries > 0) await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (!success) {
      // Emergency: save to localStorage as backup
      try {
        localStorage.setItem(`finapply_emergency_${token}`, JSON.stringify({
          application_id: applicationId,
          case_code: activeCase?.code,
          content,
          word_count: wordCount,
          time_taken_seconds: TOTAL_TIME - timeLeft,
          started_at: startedAt.current,
          failed_at: new Date().toISOString(),
        }));
      } catch { /* last resort failed */ }
    }
    // Clear session + stop webcam + exit fullscreen
    try { localStorage.removeItem(`finapply_session_${token}`); } catch {}
    if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch {}
    }
    setPhase('submitted');
    setSubmitting(false);
  }, [content, wordCount, timeLeft, applicationId, token, activeCase, tabViolations, webcamStream]);

  // Keep autoSubmitRef in sync for proctoring hooks
  autoSubmitRef.current = handleAutoSubmit;

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    await handleAutoSubmit();
  };

  const activeGuide = GUIDE_TABS.find((t) => t.id === activeTab);

  // Loading state
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.40)', marginTop: 16, fontSize: 14 }}>
            Validating your access token...
          </p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (phase === 'invalid') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🔒</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>Invalid or Expired Link</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', marginTop: 16, lineHeight: 1.6 }}>
            This Deal Room link is invalid, has expired, or has already been used. Please check your email for the correct link.
          </p>
          <div style={{ marginTop: 32 }}>
            <PillButton variant="secondary" href="/">
              Return to FinApply.ai
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Instructions screen
  if (phase === 'instructions') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 24 }}>
            DEAL ROOM — INSTRUCTIONS
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
            Welcome{candidateName ? `, ${candidateName.split(' ')[0]}` : ''}.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, marginTop: 16 }}>
            You have <strong style={{ color: '#fff' }}>90 minutes</strong> to analyze a real company case and write your investment recommendation.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '📄', text: 'Read the case packet carefully — company overview, financials, and key risks' },
              { icon: '✍️', text: 'Write a structured investment analysis (800-1500 words recommended)' },
              { icon: '⏱️', text: 'Timer starts when you click Begin — it auto-submits at 90 minutes' },
              { icon: '🔒', text: 'Your work is auto-saved every 30 seconds — no risk of losing progress' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}

            {/* Proctoring notice */}
            <div style={{
              marginTop: 24, padding: 16, borderRadius: 12,
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', marginBottom: 8 }}>🛡️ Proctored Environment</p>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>• Your camera will be activated for identity verification</span>
                <span>• The exam runs in fullscreen mode — exiting is logged</span>
                <span>• Switching tabs or windows is flagged as a violation</span>
                <span>• After {MAX_TAB_VIOLATIONS} tab violations, your work auto-submits</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <PillButton variant="primary" large onClick={handleStart}>
              Begin Simulation →
            </PillButton>
            <PillButton variant="outline" large onClick={handleStartPractice}>
              ⚡ 10-Min Practice First
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Practice warm-up screen
  if (phase === 'warmup') {
    const practiceWordCount = practiceContent.trim() ? practiceContent.trim().split(/\s+/).length : 0;
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
        {/* Warm-up header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 32px', borderBottom: '1px solid rgba(217,119,6,0.15)',
          position: 'sticky', top: 0, background: '#000', zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#D97706' }}>⚡ Practice Warm-Up</span>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
              background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)',
              color: '#D97706',
            }}>NOT SCORED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600, color: '#D97706' }}>
              {formatTime(practiceTimeLeft)}
            </span>
            <PillButton variant="outline" onClick={handleSkipPractice}>Skip to Real Case →</PillButton>
          </div>
        </header>
        <div style={{ flex: 1, padding: 32, maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <div style={{
            background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)',
            borderRadius: 12, padding: 20, marginBottom: 24,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Practice Mini-Case</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, margin: 0 }}>
              A mid-cap consumer goods company (₹2,400 Cr revenue) is considering acquiring a D2C brand
              for ₹350 Cr. The D2C brand has 40% YoY growth but is EBITDA-negative. The acquirer's PE
              ratio is 22x. In 200 words, outline: (1) whether this is value-accretive, (2) key risks,
              and (3) your recommendation.
            </p>
          </div>
          <textarea
            value={practiceContent}
            onChange={(e) => setPracticeContent(e.target.value)}
            placeholder="Write your practice response here... This is not scored."
            style={{
              width: '100%', minHeight: 300, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(217,119,6,0.12)', borderRadius: 12,
              padding: 24, fontSize: 14, color: '#fff', lineHeight: 1.7,
              resize: 'none', outline: 'none', fontFamily: 'var(--font-family)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
            <span>{practiceWordCount} words</span>
            <span style={{ color: '#D97706' }}>Practice only — not saved or scored</span>
          </div>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <PillButton variant="primary" large onClick={handleSkipPractice}>
              I'm warmed up — Start Real Case →
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Submitted screen
  if (phase === 'submitted') {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✅</div>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>Simulation Complete</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', marginTop: 16, lineHeight: 1.6 }}>
            Your analysis has been submitted. You wrote <strong style={{ color: '#fff' }}>{wordCount} words</strong> in{' '}
            <strong style={{ color: '#fff' }}>{Math.round((TOTAL_TIME - timeLeft) / 60)} minutes</strong>.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', marginTop: 24 }}>
            Your FISS Score Report will be delivered to your email within 48 hours.
          </p>
          <div style={{ marginTop: 32 }}>
            <PillButton variant="secondary" href="/">
              Return to FinApply.ai
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // Active Deal Room
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          background: '#000',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>FinApply.ai — Deal Room</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: 100,
              background: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.25)',
              color: '#2563EB',
            }}
          >
            {activeCase?.code}
          </span>
          {/* Proctoring status indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 100,
              background: webcamStream ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
              border: `1px solid ${webcamStream ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}`,
              color: webcamStream ? '#16A34A' : '#DC2626',
            }}>
              {webcamStream ? '🔴 REC' : '⚠ CAM OFF'}
            </span>
            {tabViolations > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)',
                color: '#DC2626',
              }}>
                ⚠ {tabViolations}/{MAX_TAB_VIOLATIONS} violations
              </span>
            )}
          </div>
        </div>

        {/* Timer + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            className={timeLeft <= 900 ? 'timer-pulse' : ''}
            style={{
              fontFamily: 'monospace',
              fontSize: 20,
              fontWeight: 600,
              color: getTimerColor(),
              transition: 'color 300ms',
            }}
          >
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={() => setShowExitModal(true)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: 100,
              border: '1px solid rgba(220,38,38,0.30)',
              background: 'rgba(220,38,38,0.08)',
              color: '#DC2626',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            Exit
          </button>
          <PillButton variant="primary" onClick={() => setShowSubmitModal(true)} disabled={wordCount < 10}>
            Submit Analysis
          </PillButton>
        </div>
      </header>

      {/* Main content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 3fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left — Case Packet (40%) */}
        <div
          style={{
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: 32,
            overflowY: 'auto',
            height: 'calc(100vh - 57px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3 }}>
              CASE PACKET — {activeCase?.code}
            </p>
            {!caseChangeUsed && (
              <button
                onClick={() => setShowChangeCaseModal(true)}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '4px 12px',
                  borderRadius: 100,
                  border: '1px solid rgba(217,119,6,0.30)',
                  background: 'rgba(217,119,6,0.08)',
                  color: '#D97706',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                🔄 Change Case (1 free)
              </button>
            )}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{activeCase?.title}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>{activeCase?.role} • {activeCase?.difficulty}</p>

          {/* Situation */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Situation</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.situation}
            </div>
          </div>

          {/* Company Overview */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Company Overview</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.company_overview}
            </div>
          </div>

          {/* Financial Data Table */}
          {activeCase?.financials && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Financial Data</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {activeCase.financials.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: i === 0 ? 'left' : 'right',
                            padding: '8px 10px',
                            borderBottom: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.50)',
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeCase.financials.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td
                          style={{
                            padding: '6px 10px',
                            color: 'rgba(255,255,255,0.70)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            fontWeight: 500,
                          }}
                        >
                          {row.label}
                        </td>
                        {row.values.map((v, vi) => (
                          <td
                            key={vi}
                            style={{
                              textAlign: 'right',
                              padding: '6px 10px',
                              color: '#fff',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Market Context */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Market Context</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.market_context}
            </div>
          </div>

          {/* Task */}
          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Your Task</h3>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeCase?.task}
            </div>
          </div>
        </div>

        {/* Right — Editor (60%) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 32,
            height: 'calc(100vh - 57px)',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.40)', letterSpacing: 3, marginBottom: 16 }}>
            YOUR ANALYSIS
          </p>

          {/* Section Guide Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {GUIDE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: activeTab === tab.id
                    ? '1px solid rgba(37,99,235,0.40)'
                    : '1px solid rgba(255,255,255,0.10)',
                  background: activeTab === tab.id
                    ? 'rgba(37,99,235,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.id ? '#2563EB' : 'rgba(255,255,255,0.50)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contextual hint */}
          {activeGuide && (
            <div
              style={{
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.12)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 12,
              }}
            >
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', lineHeight: 1.5 }}>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Tip:</span>{' '}
                {activeGuide.hint}
              </p>
            </div>
          )}

          <textarea
            ref={textAreaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin your investment analysis here...

Structure your response with clear sections:
1. Revenue Quality & Growth Assessment
2. Valuation Approach
3. Key Risks & Mitigation
4. Investment Recommendation"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 24,
              fontSize: 14,
              fontFamily: 'var(--font-family)',
              color: '#fff',
              lineHeight: 1.7,
              resize: 'none',
              outline: 'none',
            }}
          />

          {/* Word count */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 12,
              fontSize: 12,
              color: 'rgba(255,255,255,0.40)',
            }}
          >
            <span>
              {wordCount} words{' '}
              {wordCount < 800 && wordCount > 0 && (
                <span style={{ color: '#D97706' }}>— aim for 800+</span>
              )}
              {wordCount >= 800 && wordCount <= 1500 && (
                <span style={{ color: '#16A34A' }}>— excellent range</span>
              )}
              {wordCount > 1500 && (
                <span style={{ color: '#D97706' }}>— consider being more concise</span>
              )}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {saveError ? (
                <span style={{ color: '#DC2626' }}>⚠ Save failed</span>
              ) : lastSaved ? (
                <span>✓ Saved at {lastSaved}</span>
              ) : (
                <span>Auto-saves every 30s</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
          Submit Your Analysis?
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5, marginBottom: 8 }}>
          You have <strong style={{ color: '#fff' }}>{formatTime(timeLeft)}</strong> remaining
          and have written <strong style={{ color: '#fff' }}>{wordCount} words</strong>.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 }}>
          This action cannot be undone. Your analysis will be reviewed and scored.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton variant="outline" onClick={() => setShowSubmitModal(false)}>
            Keep Working
          </PillButton>
          <PillButton variant="primary" onClick={handleSubmit} loading={submitting}>
            Submit Final Analysis
          </PillButton>
        </div>
      </Modal>

      {/* Exit confirmation modal */}
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
          Exit Simulation?
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5, marginBottom: 8 }}>
          You have <strong style={{ color: '#fff' }}>{formatTime(timeLeft)}</strong> remaining.
          Your progress will <strong style={{ color: '#DC2626' }}>not be saved</strong>.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 }}>
          You can re-join using the same link. A new random case will be assigned and the timer resets.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton variant="outline" onClick={() => setShowExitModal(false)}>
            Continue Working
          </PillButton>
          <button
            onClick={handleExit}
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: '10px 24px',
              borderRadius: 100,
              border: '1px solid rgba(220,38,38,0.40)',
              background: 'rgba(220,38,38,0.15)',
              color: '#DC2626',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            Exit Simulation
          </button>
        </div>
      </Modal>

      {/* Change case confirmation modal */}
      <Modal isOpen={showChangeCaseModal} onClose={() => setShowChangeCaseModal(false)}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
          Change Your Case?
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', lineHeight: 1.5, marginBottom: 8 }}>
          You will receive a new random case from your role track.
          This is your <strong style={{ color: '#D97706' }}>only free change</strong> — you cannot switch again after this.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 8 }}>
          Your current analysis will be cleared. The timer keeps running.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 }}>
          Current case: <strong style={{ color: '#fff' }}>{activeCase?.code} — {activeCase?.title}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton variant="outline" onClick={() => setShowChangeCaseModal(false)}>
            Keep Current Case
          </PillButton>
          <PillButton variant="primary" onClick={handleChangeCase}>
            Get New Case
          </PillButton>
        </div>
      </Modal>

      {/* ── Tab Violation Warning Overlay ── */}
      {showViolationWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#DC2626', marginBottom: 12 }}>
              Tab Switch Detected
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.70)', lineHeight: 1.6, marginBottom: 8 }}>
              Leaving the exam window is a <strong style={{ color: '#fff' }}>proctoring violation</strong>.
              This has been logged and will be visible in your report.
            </p>
            <div style={{
              display: 'inline-block', padding: '8px 20px', borderRadius: 100,
              background: tabViolations >= MAX_TAB_VIOLATIONS ? 'rgba(220,38,38,0.15)' : 'rgba(217,119,6,0.12)',
              border: `1px solid ${tabViolations >= MAX_TAB_VIOLATIONS ? 'rgba(220,38,38,0.40)' : 'rgba(217,119,6,0.30)'}`,
              color: tabViolations >= MAX_TAB_VIOLATIONS ? '#DC2626' : '#D97706',
              fontSize: 14, fontWeight: 600, margin: '16px 0',
            }}>
              Violation {tabViolations} of {MAX_TAB_VIOLATIONS}
            </div>
            {tabViolations >= MAX_TAB_VIOLATIONS ? (
              <p style={{ fontSize: 14, color: '#DC2626', fontWeight: 600 }}>
                Maximum violations reached. Your work is being auto-submitted.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', marginBottom: 24 }}>
                  {MAX_TAB_VIOLATIONS - tabViolations} violation{MAX_TAB_VIOLATIONS - tabViolations !== 1 ? 's' : ''} remaining before auto-submission.
                </p>
                <PillButton variant="primary" onClick={() => { setShowViolationWarning(false); enterFullscreen(); }}>
                  Return to Exam
                </PillButton>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Webcam Feed (bottom-right corner) ── */}
      {phase === 'active' && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 100,
          borderRadius: 12, overflow: 'hidden',
          border: `2px solid ${webcamStream ? 'rgba(22,163,74,0.40)' : 'rgba(220,38,38,0.40)'}`,
          background: '#000', boxShadow: '0 4px 24px rgba(0,0,0,0.60)',
        }}>
          {webcamStream ? (
            <video
              ref={webcamRef}
              autoPlay
              playsInline
              muted
              style={{ width: 160, height: 120, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: 160, height: 120, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(220,38,38,0.06)',
            }}>
              <span style={{ fontSize: 11, color: '#DC2626', textAlign: 'center', padding: 8 }}>
                📷 Camera denied<br/>Flagged in report
              </span>
            </div>
          )}
          <div style={{
            position: 'absolute', top: 6, left: 6,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: webcamStream ? '#DC2626' : '#666',
              animation: webcamStream ? 'blink 1.5s infinite' : 'none',
            }} />
            <span style={{ fontSize: 9, color: '#fff', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.80)' }}>
              {webcamStream ? 'PROCTORED' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      {/* ── Fullscreen re-enter prompt ── */}
      {phase === 'active' && !isFullscreen && !showViolationWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
          padding: '8px 16px', background: 'rgba(217,119,6,0.12)',
          borderBottom: '1px solid rgba(217,119,6,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 12, color: '#D97706', fontWeight: 500 }}>
            ⚠ Fullscreen mode exited — this is being logged
          </span>
          <button
            onClick={enterFullscreen}
            style={{
              fontSize: 11, fontWeight: 600, padding: '4px 14px',
              borderRadius: 100, border: '1px solid rgba(217,119,6,0.40)',
              background: 'rgba(217,119,6,0.15)', color: '#D97706',
              cursor: 'pointer',
            }}
          >
            Re-enter Fullscreen
          </button>
        </div>
      )}

      <style jsx>{`
        .timer-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

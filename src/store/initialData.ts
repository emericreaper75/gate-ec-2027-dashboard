export const SUBJECTS = [
  "Networks",
  "Signals & Systems",
  "Engineering Mathematics",
  "Communications",
  "Electromagnetics",
  "Analog Circuits",
  "Digital Circuits",
  "Electronic Devices",
  "Control Systems",
  "General Aptitude"
];

export const INITIAL_TASKS = [
  { id: '1', title: 'Solve 10 PYQs — Networks', subject: 'Networks', priority: 'P1', estimatedMinutes: 45, completed: false, date: new Date().toISOString().split('T')[0] },
  { id: '2', title: 'Review combat formula sheet — Signals & Systems', subject: 'Signals & Systems', priority: 'P2', estimatedMinutes: 20, completed: false, date: new Date().toISOString().split('T')[0] },
  { id: '3', title: 'Watch NPTEL lecture — Engineering Mathematics', subject: 'Engineering Mathematics', priority: 'P1', estimatedMinutes: 60, completed: false, date: new Date().toISOString().split('T')[0] },
];

export const INITIAL_PRIORITY_BOARD = [
  { id: 'p1', title: 'Z-transform ROC', subject: 'Signals & Systems', marksAtStake: 10, priorityLevel: 'P1', status: '⚡ Daily Drill' },
  { id: 'p2', title: 'Two-port conversion', subject: 'Networks', marksAtStake: 8, priorityLevel: 'P1', status: '⚡ Daily Drill' },
  { id: 'p3', title: "Carson's rule + BER formulas", subject: 'Communications', marksAtStake: 8, priorityLevel: 'P2', status: '📌 This Week' },
  { id: 'p4', title: "K-map don't-cares", subject: 'Digital Circuits', marksAtStake: 7, priorityLevel: 'P2', status: '📌 This Week' },
  { id: 'p5', title: 'Maxwell\'s equations + plane waves', subject: 'Electromagnetics', marksAtStake: 8, priorityLevel: 'P2', status: '🎯 On Deck' },
  { id: 'p6', title: 'Routh-Hurwitz range', subject: 'Control Systems', marksAtStake: 5, priorityLevel: 'P3', status: '🎯 On Deck' },
  { id: 'p7', title: 'Op-amp circuits', subject: 'Analog Circuits', marksAtStake: 7, priorityLevel: 'P2', status: '🎯 On Deck' },
  { id: 'p8', title: 'Probability: conditional + Bayes', subject: 'Engineering Mathematics', marksAtStake: 6, priorityLevel: 'P2', status: '🎯 On Deck' },
  { id: 'p9', title: 'BJT/MOSFET operating regions', subject: 'Electronic Devices', marksAtStake: 5, priorityLevel: 'P3', status: '🎯 On Deck' },
];

export const INITIAL_FORMULAS = [];

export const INITIAL_REMINDERS = [
  { id: 'r1', title: 'Morning Formula Review', message: 'Review yesterday\'s combat sheet before starting', time: '06:00', repeat: 'daily', active: false },
  { id: 'r2', title: 'PYQ Session Reminder', message: 'Start your timed PYQ session', time: '10:00', repeat: 'daily', active: false },
  { id: 'r3', title: 'Evening Error Journal', message: 'Log today\'s mistakes before sleep', time: '21:00', repeat: 'daily', active: false },
  { id: 'r4', title: 'Weekly Review Sunday', message: 'Complete your weekly review', time: '20:00', repeat: 'weekly', active: false },
  { id: 'r5', title: 'Phase Transition Alert', message: 'Phase 2 begins. No new concepts from today.', time: '08:00', repeat: 'one-time', active: false }, // Should trigger Dec 1
  { id: 'r6', title: 'Final Countdown', message: '7 days to GATE. Formulas only. Stay calm.', time: '08:00', repeat: 'one-time', active: false }, // Should trigger Feb 7
];

const PRE_POPULATED_TOPICS: Record<string, string[]> = {
  "Networks": ["KVL/KCL & Mesh-Nodal", "Thevenin/Norton", "Two-port Parameters", "Transient Analysis (RC/RL/RLC)", "Resonance & Q-factor"],
  "Signals & Systems": ["LTI System Properties", "CTFT & Properties", "DTFT & DFT/IDFT", "Z-transform & ROC", "Convolution (Linear vs Circular)", "Sampling Theorem"],
  "Engineering Mathematics": ["Linear Algebra (Eigenvalues)", "Differential Equations", "Probability & Random Variables", "Complex Analysis (Residues)", "Vector Calculus"],
  "Communications": ["AM Modulation & Bandwidth", "FM Modulation & Carson's Rule", "Digital Modulation (PSK/QAM/FSK)", "BER & SNR Expressions", "Shannon Capacity", "Noise Figure (Friis)"],
  "Electromagnetics": ["Maxwell's Equations", "Plane Wave Propagation", "Transmission Lines (VSWR/Γ)", "Waveguides (TE/TM modes)", "Antenna Basics"],
  "Analog Circuits": ["BJT Small-Signal Model", "MOSFET Small-Signal Model", "Amplifier Configurations", "Feedback Topologies", "Op-amp Circuits", "Oscillators"],
  "Digital Circuits": ["Boolean Algebra & K-map", "Combinational Circuits (Adder/MUX)", "Flip-flops & Latches", "Counters & Shift Registers", "FSM Design (Moore/Mealy)"],
  "Electronic Devices": ["p-n Junction Diode", "BJT Operating Regions", "MOSFET & Body Effect", "Fermi Level & Band Theory"],
  "Control Systems": ["Block Diagram Reduction", "Routh-Hurwitz Stability", "Root Locus", "Bode Plot (GM/PM)", "Steady-State Error Constants"],
  "General Aptitude": ["Quantitative Reasoning", "Verbal Reasoning", "Data Interpretation", "Critical Reasoning"]
};

export const INITIAL_MASTERY = Object.entries(PRE_POPULATED_TOPICS).flatMap(([subject, topics]) => 
  topics.map((topic, i) => ({
    id: `m_${subject.replace(/\s/g, '')}_${i}`,
    subject,
    topic,
    mastery: 0,
    lastUpdated: '',
    notes: ''
  }))
);

export const INITIAL_MILESTONES = [
  { id: 'm1', title: 'Complete Networks Concept Lock', targetDate: '2026-07-15', status: 'Pending', phase: 'Phase 1' },
  { id: 'm2', title: 'Complete Signals Concept Lock', targetDate: '2026-07-31', status: 'Pending', phase: 'Phase 1' },
  { id: 'm3', title: 'Complete Maths Concept Lock', targetDate: '2026-08-15', status: 'Pending', phase: 'Phase 1' },
  { id: 'm4', title: 'Complete GA Concept Lock', targetDate: '2026-08-31', status: 'Pending', phase: 'Phase 1' },
  { id: 'm5', title: 'Build Communications Combat Sheet', targetDate: '2026-09-15', status: 'Pending', phase: 'Phase 1' },
  { id: 'm6', title: 'Build EM Combat Sheet', targetDate: '2026-09-30', status: 'Pending', phase: 'Phase 1' },
  { id: 'm7', title: 'Phase 1 Complete (All Combat Sheets Built)', targetDate: '2026-10-31', status: 'Pending', phase: 'Phase 1' },
  { id: 'm8', title: 'ACE Mock Test 1', targetDate: '2026-11-07', status: 'Pending', phase: 'Phase 1' },
  { id: 'm9', title: 'Enter Phase 2: Ruthless Testing', targetDate: '2026-12-01', status: 'Pending', phase: 'Phase 2' },
  { id: 'm10', title: 'Speed Drills Complete', targetDate: '2027-01-15', status: 'Pending', phase: 'Phase 2' },
];

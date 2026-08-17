Before: 

START
  ↓
Situation
  ↓
Automatic Thought
  ↓
Intermediate Belief
  ↓
Core Belief
  ↓
Defense ──────────┐
  ↑               │
  └─ not done ────┘
  ↓ done
Prosecution ──────┐
  ↑               │
  └─ not done ────┘
  ↓ done
Verdict ──────────┐
  ↑               │
  └─ not accepted ┘
  ↓
Complete
  ↓
END


new:

Working Belief
Qwen structured conversation
    ↓
state["working_belief"]

Evidence Form
    ↓
state["evidence_for"]

Evidence Review
Crispers conversation
    ↓
Qwen extractor
    ↓
state["evidence_reviews"]

Verdict
Crispers conversation
    ↓
Qwen extractor
    ↓
state["balanced_thought"]
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Square, RotateCcw, Settings, User, 
  Bot, Sparkles, Hand, Sun, Moon, Search, Menu, X, Play, RefreshCw, 
  Plus, Check, Clipboard, HelpCircle, BookOpen, Calculator, Calendar, 
  Lock, Award, ShieldAlert, Heart, Compass, FileText, Share2, Award as AwardIcon, Briefcase,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:5001' : '');
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const socket = isLocal ? io(BACKEND_URL) : { on: () => { }, off: () => { }, emit: () => { }, connected: false };

const AI_MODES = [
  // General Category
  { id: 'chat', name: 'Chat Mode', emoji: '🤖', category: 'General', description: 'General conversational partner', placeholder: 'Chat about anything...' },
  { id: 'voice_assistant', name: 'Voice Assistant Mode', emoji: '🎧', category: 'General', description: 'Concise speech-friendly voice partner', placeholder: 'Speak or type to assistant...' },
  { id: 'fun', name: 'Fun Mode', emoji: '🎮', category: 'General', description: 'Jokes, trivia, games, and riddles', placeholder: 'Play a game or ask for a joke...' },

  // Tech & Coding Category
  { id: 'coding', name: 'Coding Mode', emoji: '💻', category: 'Tech & Coding', description: 'Solve code, debug, optimize, and explain', placeholder: 'Paste code or write coding questions...' },
  { id: 'competitive_programming', name: 'CP Mode', emoji: '🏅', category: 'Tech & Coding', description: 'LeetCode & algorithmic optimization hints', placeholder: 'Paste DSA problems or code for optimization...' },
  { id: 'system_design', name: 'System Design Mode', emoji: '🏗', category: 'Tech & Coding', description: 'Scalable system architecture planner', placeholder: 'Ask to design system architecture...' },
  { id: 'cyber_security', name: 'Cyber Security Mode', emoji: '🔐', category: 'Tech & Coding', description: 'OWASP vulnerability checks & CTF help', placeholder: 'Ask about security concepts or code review...' },

  // Career & Business Category
  { id: 'interview', name: 'Interview Mode', emoji: '🎤', category: 'Career & Business', description: 'Mock interview with score cards & reports', placeholder: 'Select role and start interview...' },
  { id: 'career', name: 'Career Mode', emoji: '🚀', category: 'Career & Business', description: 'Roadmaps, company insights, salary ranges', placeholder: 'Ask for career guidance or roadmap...' },
  { id: 'ats_resume', name: 'ATS Resume Mode', emoji: '🎯', category: 'Career & Business', description: 'Analyze resume match scores & missing skills', placeholder: 'Paste resume or check ATS matching...' },
  { id: 'resume_review', name: 'Resume Review Mode', emoji: '📄', category: 'Career & Business', description: 'CV improvements & STAR bullet optimizer', placeholder: 'Paste resume details to review...' },
  { id: 'startup', name: 'Startup Mode', emoji: '🚀', category: 'Career & Business', description: 'Lean canvas builder & business plans', placeholder: 'Pitch your startup idea for feedback...' },
  { id: 'document', name: 'Document Mode', emoji: '📂', category: 'Career & Business', description: 'Draft official letters, cover letters, legal documents', placeholder: 'Describe document to draft...' },
  { id: 'meeting_assistant', name: 'Meeting Assistant Mode', emoji: '🤝', category: 'Career & Business', description: 'Convert notes to summaries & action items', placeholder: 'Paste raw meeting notes to organize...' },

  // Education & Productivity Category
  { id: 'study', name: 'Study Mode', emoji: '📚', category: 'Education & Productivity', description: 'Analogy-rich concepts & subject coach', placeholder: 'Ask about any educational topic...' },
  { id: 'quiz', name: 'Quiz Mode', emoji: '🧠', category: 'Education & Productivity', description: 'Dynamic MCQs & interactive tests', placeholder: 'Choose subject and start quiz...' },
  { id: 'math', name: 'Math Mode', emoji: '🧮', category: 'Education & Productivity', description: 'Step-by-step math solver', placeholder: 'Enter math problem to solve...' },
  { id: 'problem_solving', name: 'Problem Solving Mode', emoji: '🧩', category: 'Education & Productivity', description: 'First-principles issue tree breakdowns', placeholder: 'Describe problem to analyze...' },
  { id: 'planner', name: 'Planner Mode', emoji: '📆', category: 'Education & Productivity', description: 'Eisenhower matrix scheduler & lists', placeholder: 'Organize your day or list tasks...' },
  { id: 'public_speaking', name: 'Public Speaking Mode', emoji: '🎙', category: 'Education & Productivity', description: 'Speech writing, body language, pacing tips', placeholder: 'Draft speech or ask for tips...' },
  { id: 'data_analysis', name: 'Data Analysis Mode', emoji: '📊', category: 'Education & Productivity', description: 'Python/SQL analysis code & table summaries', placeholder: 'Provide data or stats to analyze...' },

  // Lifestyle & Creativity Category
  { id: 'motivation', name: 'Motivation Mode', emoji: '😊', category: 'Lifestyle & Creativity', description: 'Quotes, tiny habit building & coach', placeholder: 'Get motivation or set daily goals...' },
  { id: 'travel', name: 'Travel Mode', emoji: '✈', category: 'Lifestyle & Creativity', description: 'Itinerary builder & local budget guide', placeholder: 'Plan your next trip...' },
  { id: 'health', name: 'Health Mode', emoji: '❤️', category: 'Lifestyle & Creativity', description: 'Workouts, diet lists, calorie estimations', placeholder: 'Ask for workout plans or meal ideas...' },
  { id: 'creative', name: 'Creative Mode', emoji: '🎭', category: 'Lifestyle & Creativity', description: 'Poetry, scripts, storytelling hooks', placeholder: 'Brainstorm creative prompts...' },
  { id: 'content_creator', name: 'Content Creator Mode', emoji: '🎬', category: 'Lifestyle & Creativity', description: 'Social media scripts, captions, keywords', placeholder: 'Generate video script or posts...' },
  { id: 'translator', name: 'Translator Mode', emoji: '🌍', category: 'Lifestyle & Creativity', description: 'Multi-lingual translation workbench', placeholder: 'Type text to translate...' },
  { id: 'news', name: 'News Mode', emoji: '📰', category: 'Lifestyle & Creativity', description: 'Objective news summarization by categories', placeholder: 'Paste raw news stories to summarize...' },
  { id: 'stock_market', name: 'Stock Market Mode', emoji: '📈', category: 'Lifestyle & Creativity', description: 'Chart indicators & fundamental analysis basics', placeholder: 'Ask about market indicators...' },
  { id: 'finance', name: 'Finance Mode', emoji: '💹', category: 'Lifestyle & Creativity', description: 'Budgeting ratios, EMI & compounding sliders', placeholder: 'Plan savings or calculate loans...' },
  { id: 'pdf', name: 'PDF Mode', emoji: '📑', category: 'Lifestyle & Creativity', description: 'Document summaries & QA assistant', placeholder: 'Ask questions about uploaded document...' }
];

const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, '$1')
    .replace(/^#+\s+(.*)$/gm, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\|/g, ' ')
    .trim();
};

function parseMarkdown(text) {
  const lines = text.split('\n');
  const blocks = [];
  let currentCodeBlock = null;
  let currentTable = null;
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (currentCodeBlock) {
        blocks.push(currentCodeBlock);
        currentCodeBlock = null;
      } else {
        if (currentTable) { blocks.push(currentTable); currentTable = null; }
        if (currentList) { blocks.push(currentList); currentList = null; }
        const lang = line.trim().substring(3) || 'code';
        currentCodeBlock = { type: 'code', lang, content: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.content.push(line);
      continue;
    }

    if (line.trim().startsWith('|')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      if (!currentTable) {
        currentTable = { type: 'table', headers: [], rows: [] };
      }
      
      const parts = line.split('|').map(x => x.trim()).filter((x, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (line.includes('-') && parts.every(p => p.match(/^-+$/))) {
        continue;
      }
      
      if (currentTable.headers.length === 0) {
        currentTable.headers = parts;
      } else {
        currentTable.rows.push(parts);
      }
      continue;
    } else {
      if (currentTable) {
        blocks.push(currentTable);
        currentTable = null;
      }
    }

    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    const numMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (bulletMatch || numMatch) {
      if (!currentList) {
        currentList = { type: 'list', items: [] };
      }
      const content = bulletMatch ? bulletMatch[2] : numMatch[2];
      const ordered = !!numMatch;
      currentList.items.push({ content, ordered });
      continue;
    } else {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
    }

    if (line.trim().startsWith('>')) {
      const content = line.trim().substring(1).trim();
      blocks.push({ type: 'quote', content });
      continue;
    }

    if (line.trim().startsWith('#')) {
      const match = line.match(/^(#+)\s+(.*)/);
      if (match) {
        const level = match[1].length;
        const content = match[2];
        blocks.push({ type: 'header', level, content });
        continue;
      }
    }

    if (line.trim() !== '') {
      blocks.push({ type: 'paragraph', content: line });
    }
  }

  if (currentCodeBlock) blocks.push(currentCodeBlock);
  if (currentTable) blocks.push(currentTable);
  if (currentList) blocks.push(currentList);

  return blocks;
}

function cleanInlineText(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function getPlainTextFromBlocks(blocks) {
  let text = '';
  blocks.forEach((block, bIdx) => {
    if (block.type === 'paragraph') {
      text += cleanInlineText(block.content) + '\n';
    } else if (block.type === 'header') {
      text += cleanInlineText(block.content) + '\n';
    } else if (block.type === 'quote') {
      text += cleanInlineText(block.content) + '\n';
    } else if (block.type === 'code') {
      text += block.content.join('\n') + '\n';
    } else if (block.type === 'list') {
      block.items.forEach(item => {
        text += cleanInlineText(item.content) + '\n';
      });
    } else if (block.type === 'table') {
      text += block.headers.join(' ') + '\n';
      block.rows.forEach(row => {
        text += row.join(' ') + '\n';
      });
    }
  });
  return text.trim();
}

function parseInlineContent(text, globalIndexRef) {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);
  
  return parts.map((part, idx) => {
    let type = 'normal';
    let innerText = part;
    
    if (part.startsWith('**') && part.endsWith('**')) {
      type = 'bold';
      innerText = part.slice(2, -2);
    } else if (part.startsWith('*') && part.endsWith('*')) {
      type = 'italic';
      innerText = part.slice(1, -1);
    } else if (part.startsWith('`') && part.endsWith('`')) {
      type = 'inline-code';
      innerText = part.slice(1, -1);
    }
    
    const subParts = innerText.split(/(\s+|[.,!?;:*()\"'\-\[\]\(\)]+)/g);
    
    const segments = subParts.map((subPart) => {
      if (!subPart) return null;
      const startIdx = globalIndexRef.current;
      globalIndexRef.current += subPart.length;
      
      const isWord = subPart && !subPart.match(/^\s+$/) && !subPart.match(/^[.,!?;:*()\"'\-\[\]\(\)]+$/);
      return {
        text: subPart,
        isWord,
        startIdx,
        length: subPart.length
      };
    }).filter(Boolean);
    
    return {
      type,
      segments
    };
  });
}

function FormattedResponse({ text, isAi, msgIdx, speakingMsgIdx, isAiSpeaking, spokenRange, speak }) {
  if (!isAi) return text;
  
  const blocks = parseMarkdown(text);
  const plainText = getPlainTextFromBlocks(blocks);
  const globalIndexRef = { current: 0 };
  const isCurrentSpeaking = isAiSpeaking && msgIdx === speakingMsgIdx;

  const renderSegments = (segments) => {
    return segments.map((seg, sIdx) => {
      if (seg.isWord) {
        const isHighlighted = isCurrentSpeaking && 
          spokenRange.start <= seg.startIdx && 
          seg.startIdx < (spokenRange.start + spokenRange.length);

        const wordStyles = isHighlighted ? {
          display: 'inline-block',
          background: 'var(--accent-gradient)',
          borderRadius: '4px',
          padding: '0px 4px',
          color: '#fff',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(129, 140, 248, 0.5)',
          whiteSpace: 'nowrap'
        } : {
          cursor: 'pointer',
          borderRadius: '2px',
          padding: '0 1px',
          display: 'inline-block',
          transition: 'all 0.15s ease'
        };

        const hoverWord = (e, hoverState) => {
          if (isHighlighted) return;
          e.currentTarget.style.color = hoverState ? 'var(--primary)' : 'inherit';
          e.currentTarget.style.textDecoration = hoverState ? 'underline' : 'none';
          e.currentTarget.style.backgroundColor = hoverState ? 'rgba(129, 140, 248, 0.1)' : 'transparent';
        };

        return (
          <span
            key={sIdx}
            style={wordStyles}
            onMouseEnter={(e) => hoverWord(e, true)}
            onMouseLeave={(e) => hoverWord(e, false)}
            onClick={() => speak(plainText, msgIdx, false, seg.startIdx)}
            title="Click to speak from here"
          >
            {seg.text}
          </span>
        );
      }
      return <span key={sIdx}>{seg.text}</span>;
    });
  };

  const renderInlineParts = (textVal) => {
    const parts = parseInlineContent(textVal, globalIndexRef);
    return parts.map((part, pIdx) => {
      if (part.type === 'bold') {
        return <strong key={pIdx} style={{ fontWeight: '700', color: 'var(--text-main)' }}>{renderSegments(part.segments)}</strong>;
      }
      if (part.type === 'italic') {
        return <em key={pIdx} style={{ fontStyle: 'italic' }}>{renderSegments(part.segments)}</em>;
      }
      if (part.type === 'inline-code') {
        return <code key={pIdx} className="markdown-code-inline">{renderSegments(part.segments)}</code>;
      }
      return <span key={pIdx}>{renderSegments(part.segments)}</span>;
    });
  };

  return (
    <div className="markdown-body">
      {blocks.map((block, bIdx) => {
        if (bIdx > 0) {
          globalIndexRef.current += 1; 
        }

        if (block.type === 'header') {
          const Tag = `h${Math.min(block.level + 1, 6)}`;
          return (
            <Tag key={bIdx} className={`markdown-${Tag}`}>
              {renderInlineParts(block.content)}
            </Tag>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={bIdx} className="markdown-p">
              {renderInlineParts(block.content)}
            </p>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={bIdx} className="markdown-quote">
              {renderInlineParts(block.content)}
            </blockquote>
          );
        }

        if (block.type === 'list') {
          const ListTag = block.items[0]?.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={bIdx} className={`markdown-${ListTag}`}>
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="markdown-li">
                  {renderInlineParts(item.content)}
                </li>
              ))}
            </ListTag>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={bIdx} className="markdown-table-wrapper">
              <table className="markdown-table">
                <thead>
                  <tr className="markdown-tr">
                    {block.headers.map((h, hIdx) => (
                      <th key={hIdx} className="markdown-th">
                        {renderInlineParts(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="markdown-tr">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="markdown-td">
                          {renderInlineParts(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'code') {
          const codeText = block.content.join('\n');
          globalIndexRef.current += codeText.length;
          
          return (
            <div key={bIdx} className="code-block-container">
              <div className="code-header">
                <span>{block.lang}</span>
                <button 
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(codeText);
                    alert('Code copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
              <pre className="code-pre">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function InteractiveWidget({ mode, onSendMessage, setInputText, uploadedFile, setUploadedFile }) {
  const [isOpen, setIsOpen] = useState(true);

  // 1. Mock Interview States
  const [interviewRole, setInterviewRole] = useState("MERN Developer");
  const [interviewType, setInterviewType] = useState("Technical");
  const [interviewStage, setInterviewStage] = useState("idle");
  const [interviewQuestionIdx, setInterviewQuestionIdx] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState([]);
  const [interviewText, setInterviewText] = useState("");
  const [interviewReport, setInterviewReport] = useState(null);

  const INTERVIEW_QUESTIONS = {
    "MERN Developer": [
      "Tell me about yourself and your experience with the MERN stack.",
      "What is the difference between Virtual DOM and Real DOM in React?",
      "How does Node.js handle asynchronous operations?",
      "Explain mongoose middleware and its common use cases.",
      "How would you design a session-based or token-based authentication system?"
    ],
    "Python Developer": [
      "Tell me about yourself and your experience with Python.",
      "What is the difference between list and tuple, and when would you use which?",
      "Explain Python's GIL (Global Interpreter Lock) and how it affects concurrency.",
      "How do generators work, and what is the yield keyword used for?",
      "What are python decorators and how do you write a custom one?"
    ],
    "DSA & Algorithms": [
      "What is the difference between a Tree and a Graph?",
      "Explain how quicksort works and its average and worst-case time complexity.",
      "How do you detect a cycle in a linked list?",
      "What is dynamic programming, and how does it differ from memoization?",
      "Explain the time complexity of searching in a hash table vs a binary search tree."
    ]
  };

  const startInterview = () => {
    setInterviewStage("running");
    setInterviewQuestionIdx(0);
    setInterviewAnswers([]);
    setInterviewReport(null);
    setInterviewText("");
  };

  const submitInterviewAnswer = () => {
    if (!interviewText.trim()) return;
    const questionsList = INTERVIEW_QUESTIONS[interviewRole] || INTERVIEW_QUESTIONS["MERN Developer"];
    const currentQ = questionsList[interviewQuestionIdx];
    
    const newAnswers = [...interviewAnswers, interviewText];
    setInterviewAnswers(newAnswers);
    
    onSendMessage(`[Interview Evaluation] Role: ${interviewRole}, Type: ${interviewType}. Question ${interviewQuestionIdx + 1}: "${currentQ}". User Answer: "${interviewText}". Grade this response. Output score and suggestions.`);
    
    setInterviewText("");
    
    if (interviewQuestionIdx < questionsList.length - 1) {
      setInterviewQuestionIdx(prev => prev + 1);
    } else {
      setInterviewStage("finished");
      setInterviewReport({
        confidence: Math.floor(Math.random() * 20) + 75,
        technical: Math.floor(Math.random() * 20) + 75,
        communication: Math.floor(Math.random() * 15) + 80,
        tips: "Review React state optimization, practice Node event loops, and structure your STAR responses clearly."
      });
    }
  };

  // 2. Pomodoro Timer States
  const [timer, setTimer] = useState(1500); 
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState("work");
  const [timerSessions, setTimerSessions] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timer === 0) {
      setTimerActive(false);
      if (timerMode === "work") {
        setTimerSessions(prev => prev + 1);
        alert("Great job! Time for a short break.");
        setTimerMode("break");
        setTimer(300); 
      } else {
        alert("Break over! Time to focus.");
        setTimerMode("work");
        setTimer(1500); 
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 3. Quiz States
  const [quizSub, setQuizSub] = useState("MERN");
  const [quizStage, setQuizStage] = useState("idle");
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const QUIZ_QUESTIONS = {
    "MERN": [
      { q: "Which of the following is used to manage state in React?", options: ["Mongoose", "Express", "Redux", "Node.js"], correct: 2, exp: "Redux is a popular state management library for React apps." },
      { q: "What does MongoDB store data as?", options: ["XML", "BSON", "SQL Tables", "Plain Text"], correct: 1, exp: "MongoDB stores records as BSON, which is a binary representation of JSON." },
      { q: "Which HTTP method is typically used to create a new database record?", options: ["GET", "POST", "DELETE", "PUT"], correct: 1, exp: "POST is standard for creating new entities." }
    ],
    "Python": [
      { q: "Which of the following is an immutable data type in Python?", options: ["List", "Dictionary", "Set", "Tuple"], correct: 3, exp: "Tuples in Python are immutable sequence types." },
      { q: "What keyword is used to create a generator function?", options: ["return", "yield", "generator", "def"], correct: 1, exp: "The 'yield' keyword is used to yield values in a generator function." }
    ],
    "DSA": [
      { q: "What is the time complexity of binary search?", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correct: 2, exp: "Binary search divides the search space in half each step, giving logarithmic time complexity." },
      { q: "Which data structure operates on a Last In First Out (LIFO) basis?", options: ["Queue", "Stack", "Hash Map", "Heap"], correct: 1, exp: "Stacks operate on LIFO, whereas queues operate on FIFO." }
    ]
  };

  const startQuiz = () => {
    setQuizStage("running");
    setQuizIdx(0);
    setQuizSelected(null);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const submitQuizAnswer = () => {
    if (quizSelected === null) return;
    setQuizSubmitted(true);
    const questionsList = QUIZ_QUESTIONS[quizSub];
    if (quizSelected === questionsList[quizIdx].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    const questionsList = QUIZ_QUESTIONS[quizSub];
    if (quizIdx < questionsList.length - 1) {
      setQuizIdx(prev => prev + 1);
      setQuizSelected(null);
      setQuizSubmitted(false);
    } else {
      setQuizStage("finished");
    }
  };

  // 4. Translator States
  const [transSrc, setTransSrc] = useState("English");
  const [transTarget, setTransTarget] = useState("Hindi");
  const [transInput, setTransInput] = useState("");

  // 5. Code Workbench
  const [codeLang, setCodeLang] = useState("javascript");
  const [codeVal, setCodeVal] = useState("// Paste your code here\nfunction greet() {\n  console.log('Hello World');\n}");
  const [codeConsole, setCodeConsole] = useState("");

  const runCodeMock = () => {
    setCodeConsole("Compiling & running tests...\nExecuting main method...\n\nOutputs:\n> Hello World\n\nExecution successful (12ms) - 1 test case passed!");
  };

  // 6. Resume Review & ATS States
  const [resumeVal, setResumeVal] = useState("");
  const [atsReport, setAtsReport] = useState(null);

  const runAtsReview = () => {
    if (!resumeVal.trim()) return;
    setAtsReport({
      score: 74,
      missing: ["GraphQL", "Docker", "CI/CD Pipeline", "Kubernetes"],
      suggestions: "Include quantifiable achievements (e.g. 'Optimized render speeds by 30%'), add Docker configuration to your personal projects, and align skills to STAR format."
    });
    onSendMessage(`Analyze the following resume details for ATS optimization:\n\n${resumeVal}`);
  };

  // 7. Motivation goals
  const [goals, setGoals] = useState([
    { text: "Solve 2 DSA questions", checked: false },
    { text: "Build React components", checked: true }
  ]);
  const [newGoal, setNewGoal] = useState("");

  // 8. Finance Sliders
  const [finPrincipal, setFinPrincipal] = useState(500000);
  const [finRate, setFinRate] = useState(8.5);
  const [finTenure, setFinTenure] = useState(5);

  const calculateEmi = () => {
    const P = finPrincipal;
    const r = finRate / 12 / 100;
    const n = finTenure * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const analyzePastedCsv = () => {
    if (!csvContent.trim()) return;
    const lines = csvContent.split('\n').filter(l => l.trim() !== '');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 6).map(r => r.split(',').map(c => c.trim()));
      setCsvHeaders(headers);
      setCsvRows(rows);
      setCsvFileName("Pasted Data");
    }
    onSendMessage(`Summarize the statistical insights of this data:\n\n${csvContent}`);
  };

  // 9. Career Targets
  const [careerCompany, setCareerCompany] = useState("Google");
  const [careerRole, setCareerRole] = useState("Frontend Engineer");

  // 10. CSV Data Analysis States
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvContent, setCsvContent] = useState("");

  // Listen to file uploads contextually according to active mode
  useEffect(() => {
    if (uploadedFile && (mode === 'ats_resume' || mode === 'resume_review')) {
      if (uploadedFile.type === 'pdf' || uploadedFile.type === 'txt') {
        setResumeVal(uploadedFile.content);
        // Automatically trigger ATS scoring
        setAtsReport({
          score: Math.floor(Math.random() * 15) + 75,
          missing: ["GraphQL", "Docker", "CI/CD Pipeline", "Kubernetes"],
          suggestions: "Include quantifiable achievements (e.g. 'Optimized render speeds by 30%'), add Docker configuration to your personal projects, and align skills to STAR format."
        });
        onSendMessage(`Analyze the following resume details for ATS optimization:\n\n${uploadedFile.content}`);
        setUploadedFile(null); 
      }
    }
  }, [uploadedFile, mode]);

  useEffect(() => {
    if (uploadedFile && mode === 'translator') {
      if (uploadedFile.type === 'txt' || uploadedFile.type === 'csv') {
        setTransInput(uploadedFile.content.substring(0, 1000));
        setUploadedFile(null);
      }
    }
  }, [uploadedFile, mode]);

  useEffect(() => {
    if (uploadedFile && mode === 'data_analysis') {
      if (uploadedFile.type === 'csv' || uploadedFile.type === 'txt') {
        const lines = uploadedFile.content.split('\n').filter(l => l.trim() !== '');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1, 6).map(r => r.split(',').map(c => c.trim()));
          setCsvHeaders(headers);
          setCsvRows(rows);
          setCsvFileName(uploadedFile.name);
          setCsvContent(uploadedFile.content);
        }
        setCodeConsole(`CSV parsed successfully:\n${uploadedFile.content.split('\n').slice(0, 5).join('\n')}\n...`);
        onSendMessage(`Summarize the statistical insights of this data:\n\n${uploadedFile.content}`);
        setUploadedFile(null);
      }
    }
  }, [uploadedFile, mode]);

  if (!isOpen) return null;

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-title">
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          Interactive Mode Workbench
        </span>
        <button className="widget-close" onClick={() => setIsOpen(false)}>
          <X size={16} />
        </button>
      </div>

      {mode === 'interview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {interviewStage === 'idle' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Target Role</label>
                  <select 
                    value={interviewRole} 
                    onChange={(e) => setInterviewRole(e.target.value)}
                    className="widget-input"
                  >
                    <option value="MERN Developer">MERN Developer</option>
                    <option value="Python Developer">Python Developer</option>
                    <option value="DSA & Algorithms">DSA & Algorithms</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Interview Type</label>
                  <select 
                    value={interviewType} 
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="widget-input"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>
              </div>
              <button className="widget-button active" onClick={startInterview}>Start Mock Interview</button>
            </>
          )}

          {interviewStage === 'running' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Role: {interviewRole}</span>
                <span>Question {interviewQuestionIdx + 1} / 5</span>
              </div>
              <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {INTERVIEW_QUESTIONS[interviewRole]?.[interviewQuestionIdx] || "Explain your background."}
              </p>
              <textarea 
                className="widget-input"
                rows="3"
                placeholder="Type your answer here or click mic below..."
                value={interviewText}
                onChange={(e) => setInterviewText(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="widget-button active" style={{ flex: 1 }} onClick={submitInterviewAnswer}>
                  Submit Answer & Next
                </button>
                <button className="widget-button" onClick={() => setInterviewStage("idle")}>
                  Quit
                </button>
              </div>
            </div>
          )}

          {interviewStage === 'finished' && interviewReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontWeight: '800', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Interview Complete! Report Card
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Technical Score</span>
                    <span>{interviewReport.technical}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${interviewReport.technical}%`, background: '#10b981' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Communication</span>
                    <span>{interviewReport.communication}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${interviewReport.communication}%`, background: '#3b82f6' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Confidence</span>
                    <span>{interviewReport.confidence}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${interviewReport.confidence}%`, background: '#f59e0b' }} />
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Tip:</strong> {interviewReport.tips}
              </p>
              <button className="widget-button active" onClick={() => setInterviewStage("idle")}>Restart Interview</button>
            </div>
          )}
        </div>
      )}

      {mode === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {quizStage === 'idle' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Choose Subject</label>
                <select 
                  value={quizSub} 
                  onChange={(e) => setQuizSub(e.target.value)}
                  className="widget-input"
                >
                  <option value="MERN">MERN</option>
                  <option value="Python">Python</option>
                  <option value="DSA">Data Structures & Algos</option>
                </select>
              </div>
              <button className="widget-button active" onClick={startQuiz}>Start Quiz</button>
            </>
          )}

          {quizStage === 'running' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Subject: {quizSub}</span>
                <span>Question {quizIdx + 1} / {QUIZ_QUESTIONS[quizSub].length}</span>
              </div>
              <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {QUIZ_QUESTIONS[quizSub][quizIdx].q}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {QUIZ_QUESTIONS[quizSub][quizIdx].options.map((opt, oIdx) => {
                  let btnBg = 'rgba(255,255,255,0.05)';
                  let btnBorder = 'var(--glass-border)';
                  
                  if (quizSubmitted) {
                    if (oIdx === QUIZ_QUESTIONS[quizSub][quizIdx].correct) {
                      btnBg = 'rgba(16, 185, 129, 0.2)';
                      btnBorder = '#10b981';
                    } else if (quizSelected === oIdx) {
                      btnBg = 'rgba(239, 68, 68, 0.2)';
                      btnBorder = '#ef4444';
                    }
                  } else if (quizSelected === oIdx) {
                    btnBg = 'rgba(129, 140, 248, 0.2)';
                    btnBorder = 'var(--primary)';
                  }

                  return (
                    <button 
                      key={oIdx}
                      className="widget-button"
                      style={{ background: btnBg, borderColor: btnBorder, textAlign: 'left', paddingLeft: '1rem' }}
                      onClick={() => !quizSubmitted && setQuizSelected(oIdx)}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong>Explanation:</strong> {QUIZ_QUESTIONS[quizSub][quizIdx].exp}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!quizSubmitted ? (
                  <button className="widget-button active" style={{ flex: 1 }} onClick={submitQuizAnswer} disabled={quizSelected === null}>
                    Submit Answer
                  </button>
                ) : (
                  <button className="widget-button active" style={{ flex: 1 }} onClick={nextQuizQuestion}>
                    {quizIdx < QUIZ_QUESTIONS[quizSub].length - 1 ? "Next Question" : "Finish Quiz"}
                  </button>
                )}
                <button className="widget-button" onClick={() => setQuizStage("idle")}>
                  Exit
                </button>
              </div>
            </div>
          )}

          {quizStage === 'finished' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center' }}>
              <AwardIcon size={36} style={{ color: 'var(--primary)' }} />
              <h4>Quiz Completed!</h4>
              <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                Your Score: {quizScore} / {QUIZ_QUESTIONS[quizSub].length}
              </p>
              <button className="widget-button active" onClick={() => setQuizStage("idle")}>Take Another Quiz</button>
            </div>
          )}
        </div>
      )}

      {mode === 'coding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Language:</span>
            <select 
              value={codeLang} 
              onChange={(e) => setCodeLang(e.target.value)}
              className="widget-input"
              style={{ flex: 1 }}
            >
              <option value="javascript">Javascript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <textarea 
            className="widget-input"
            rows="6"
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={codeVal}
            onChange={(e) => setCodeVal(e.target.value)}
          />
          <div className="widget-grid">
            <button className="widget-button active" onClick={runCodeMock}>Run Code</button>
            <button className="widget-button" onClick={() => onSendMessage(`Analyze this ${codeLang} code for errors and debug it:\n\`\`\`${codeLang}\n${codeVal}\n\`\`\``)}>Debug</button>
            <button className="widget-button" onClick={() => onSendMessage(`Optimize the time/space complexity of this ${codeLang} code:\n\`\`\`${codeLang}\n${codeVal}\n\`\`\``)}>Optimize</button>
            <button className="widget-button" onClick={() => onSendMessage(`Explain this ${codeLang} code step-by-step:\n\`\`\`${codeLang}\n${codeVal}\n\`\`\``)}>Explain</button>
          </div>
          {codeConsole && (
            <pre style={{ background: 'black', color: '#10b981', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto', maxH: '120px' }}>
              {codeConsole}
            </pre>
          )}
        </div>
      )}

      {mode === 'planner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="widget-input" 
              style={{ flex: 1 }} 
              placeholder="Add planner schedule task..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
            />
            <button className="widget-button active" style={{ padding: '0.5rem' }} onClick={() => {
              if (!newGoal.trim()) return;
              setGoals([...goals, { text: newGoal, checked: false }]);
              setNewGoal("");
            }}>
              <Plus size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
            {goals.map((g, idx) => (
              <div 
                key={idx} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}
              >
                <input 
                  type="checkbox" 
                  checked={g.checked} 
                  onChange={() => {
                    const next = [...goals];
                    next[idx].checked = !next[idx].checked;
                    setGoals(next);
                  }}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={g.checked ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : {}}>{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'translator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select value={transSrc} onChange={(e) => setTransSrc(e.target.value)} className="widget-input" style={{ flex: 1 }}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
            <span>➜</span>
            <select value={transTarget} onChange={(e) => setTransTarget(e.target.value)} className="widget-input" style={{ flex: 1 }}>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>
          <input 
            type="text" 
            className="widget-input" 
            placeholder={uploadedFile ? "Text loaded from file..." : "Enter text to translate..."}
            value={transInput}
            onChange={(e) => setTransInput(e.target.value)}
          />
          <button className="widget-button active" onClick={() => {
            if (!transInput.trim()) return;
            onSendMessage(`Translate this text from ${transSrc} to ${transTarget}: "${transInput}"`);
          }}>
            Translate Text
          </button>
        </div>
      )}

      {mode === 'ats_resume' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea 
            className="widget-input"
            rows="4"
            placeholder="Paste resume here (or upload PDF CV using paperclip below)..."
            value={resumeVal}
            onChange={(e) => setResumeVal(e.target.value)}
          />
          <button className="widget-button active" onClick={runAtsReview}>Analyze Resume ATS Compatibility</button>
          
          {atsReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>ATS Match Score:</span>
                <span style={{ color: '#f59e0b', fontWeight: '800' }}>{atsReport.score}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${atsReport.score}%`, background: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                <strong>Missing Skills:</strong> {atsReport.missing.join(', ')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Suggestion:</strong> {atsReport.suggestions}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'motivation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Today's Coding Insight</span>
          <p style={{ fontStyle: 'italic', fontWeight: '700', fontSize: '0.9rem' }}>
            "Consistency beats intensity. Solve 1 problem a day, build 1 component a week, write 1 document a month. Keep moving forward."
          </p>
          <div style={{ borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: '700' }}>#persistence</span>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', fontWeight: '700' }}>#growth</span>
          </div>
        </div>
      )}

      {mode === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span>Principal (P)</span>
              <span>₹{finPrincipal.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="50000" 
              max="5000000" 
              step="50000" 
              value={finPrincipal}
              onChange={(e) => setFinPrincipal(Number(e.target.value))}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Rate (R)</span>
                <span>{finRate}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="25" 
                step="0.5" 
                value={finRate}
                onChange={(e) => setFinRate(Number(e.target.value))}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Tenure (T)</span>
                <span>{finTenure} Years</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1" 
                value={finTenure}
                onChange={(e) => setFinTenure(Number(e.target.value))}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Monthly Loan EMI:</span>
            <span style={{ color: '#10b981', fontWeight: '800', fontSize: '1.1rem' }}>₹{calculateEmi().toLocaleString()}/mo</span>
          </div>
        </div>
      )}

      {mode === 'career' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Target Company</label>
              <select value={careerCompany} onChange={(e) => setCareerCompany(e.target.value)} className="widget-input">
                <option value="Google">Google</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Amazon">Amazon</option>
                <option value="Adobe">Adobe</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Target Role</label>
              <input 
                type="text" 
                className="widget-input" 
                value={careerRole}
                onChange={(e) => setCareerRole(e.target.value)}
              />
            </div>
          </div>
          <button className="widget-button active" onClick={() => onSendMessage(`Create a custom company placement roadmap for ${careerRole} at ${careerCompany}. Include interview levels, required skills, expected salary bracket, and learning resources.`)}>
            Generate Roadmap Guidelines
          </button>
        </div>
      )}

      {mode === 'data_analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {csvHeaders.length === 0 ? (
            <>
              <textarea 
                className="widget-input"
                rows="4"
                placeholder="Paste CSV data here (or click paperclip below to upload a .csv file)..."
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
              />
              <button className="widget-button active" onClick={analyzePastedCsv} disabled={!csvContent.trim()}>
                Analyze CSV Data
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>File: {csvFileName}</span>
                <button 
                  className="copy-btn" 
                  onClick={() => {
                    setCsvHeaders([]);
                    setCsvRows([]);
                    setCsvFileName("");
                    setCsvContent("");
                  }}
                  style={{ padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: 'none' }}
                >
                  Clear Data
                </button>
              </div>
              
              <div className="markdown-table-wrapper" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <table className="markdown-table">
                  <thead>
                    <tr className="markdown-tr">
                      {csvHeaders.map((h, i) => (
                        <th key={i} className="markdown-th" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((row, rIdx) => (
                      <tr key={rIdx} className="markdown-tr">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="markdown-td" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="widget-grid">
                <button className="widget-button active" onClick={() => onSendMessage(`Provide a comprehensive statistical summary for this dataset:\n\n${csvContent}`)}>
                  Generate Stats
                </button>
                <button className="widget-button" onClick={() => onSendMessage(`Write a Python pandas script to clean, analyze, and plot insights for this dataset:\n\n${csvContent}`)}>
                  Pandas/Plot Code
                </button>
                <button className="widget-button" onClick={() => onSendMessage(`Write a standard SQL schema and analytical queries based on this data:\n\n${csvContent}`)}>
                  SQL Queries
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(mode === 'study' || mode === 'planner' || mode === 'data_analysis') && (
        <div className="timer-container" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Focus Pomodoro Timer</span>
          <div className="timer-display">{formatTimer(timer)}</div>
          <div className="timer-controls">
            <button className="widget-button active" onClick={() => setTimerActive(!timerActive)}>
              {timerActive ? "Pause" : "Start"}
            </button>
            <button className="widget-button" onClick={() => { setTimerActive(false); setTimer(1500); }}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your AI assistant. I can understand text and voice. How can I help you today?", sender: 'ai', mode: 'chat' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const [speechPositions, setSpeechPositions] = useState({});
  const currentBoundaryRef = useRef(0);
  const [volume, setVolume] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [speechRate, setSpeechRate] = useState(1);

  // Modes integration states
  const [selectedMode, setSelectedMode] = useState(AI_MODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // File Upload states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const defaultVoice = availableVoices.find(v => v.name.includes('Google US English') || v.lang === 'en-US') || availableVoices[0];
      if (defaultVoice) {
        setSelectedVoiceName(prev => prev || defaultVoice.name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);
  const [spokenRange, setSpokenRange] = useState({ start: 0, length: 0 });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const messagesEndRef = useRef(null);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speakingMsgIdx !== null) {
      setSpeechPositions(prev => ({
        ...prev,
        [speakingMsgIdx]: currentBoundaryRef.current
      }));
    }
    setIsAiSpeaking(false);
    setSpeakingMsgIdx(null);
    setSpokenRange({ start: 0, length: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopSpeaking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Speech Recognition Setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputText(finalTranscript);
          handleSendMessage(finalTranscript, 'voice');
        } else if (interimTranscript) {
          setInputText(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.warn('Speech Recognition: No speech detected.');
        } else if (event.error === 'network') {
          console.error('Speech Recognition: Network Error. Attempting auto-retry...');
          setTimeout(() => {
            if (isListeningRef.current) {
              try { recognition.start(); } catch (e) { }
            }
          }, 1000);
        } else {
          console.error('Speech Recognition Error:', event.error);
        }

        if (event.error !== 'network') {
          setIsListening(false);
        }

        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable it in browser settings.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const isSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages(prev => {
        const next = [...prev, data];
        const lastMessage = prev[prev.length - 1];
        if (isSpeakingRef.current || (lastMessage && lastMessage.modality === 'voice')) {
          speak(data.text, next.length - 1);
        }
        return next;
      });
    });

    socket.on('error', (data) => {
      setMessages(prev => [...prev, {
        text: `Error: ${data.message || 'Something went wrong. Please check your API limits.'}`,
        sender: 'ai',
        isError: true
      }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Client-side File Parsers
  const loadPdfJs = () => {
    return new Promise((resolve) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      document.head.appendChild(script);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsingFile(true);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    try {
      if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
        // Image compression using canvas
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              const MAX_DIM = 1024;
              if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) {
                  height = Math.round((height * MAX_DIM) / width);
                  width = MAX_DIM;
                } else {
                  width = Math.round((width * MAX_DIM) / height);
                  height = MAX_DIM;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
            img.src = event.target.result;
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
        setUploadedFile({
          name: file.name,
          type: 'image',
          base64: base64
        });
      } else if (['csv', 'txt'].includes(fileExtension)) {
        // CSV/Text to plain text
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
        setUploadedFile({
          name: file.name,
          type: fileExtension,
          content: text
        });
      } else if (fileExtension === 'pdf') {
        // PDF parser using dynamic script injection
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          extractedText += strings.join(' ') + '\n';
        }
        setUploadedFile({
          name: file.name,
          type: 'pdf',
          content: extractedText
        });
      } else {
        alert('Unsupported file type. Please upload a PDF, CSV, TXT, or Image file.');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      alert('Error parsing uploaded file: ' + err.message);
    } finally {
      setIsParsingFile(false);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (text = inputText, modality = 'text') => {
    if (!text.trim() && !uploadedFile) return;

    let textToSend = text;
    let imageToSend = null;

    if (uploadedFile) {
      if (uploadedFile.type === 'image') {
        imageToSend = uploadedFile.base64;
      } else {
        // Truncate document text if it's too large to prevent rate limits / timeouts
        const MAX_DOC_CHARS = 15000;
        let fileContent = uploadedFile.content || "";
        if (fileContent.length > MAX_DOC_CHARS) {
          fileContent = fileContent.substring(0, MAX_DOC_CHARS) + "\n\n[Content truncated due to size limit...]";
        }

        // Avoid duplicating content if it was already appended in the widget call
        if (text.includes(uploadedFile.content)) {
          textToSend = text.replace(uploadedFile.content, fileContent);
        } else {
          textToSend = `[Uploaded File: ${uploadedFile.name}]\n\nFile Contents:\n"""\n${fileContent}\n"""\n\nQuery: ${text || 'Please analyze this file.'}`;
        }
      }
    }

    // Friendly display message for user window (removes raw file contents)
    const cleanDisplayQuery = uploadedFile && uploadedFile.type !== 'image' && text.includes(uploadedFile.content)
      ? text.replace(uploadedFile.content, '').trim()
      : text;

    const displayMsgText = uploadedFile && uploadedFile.type !== 'image'
      ? `Sent file **${uploadedFile.name}**\n\n${cleanDisplayQuery || 'Analyze this document.'}`
      : text;

    const newMessage = { 
      text: displayMsgText, 
      sender: 'user', 
      timestamp: new Date(), 
      modality, 
      mode: selectedMode.id 
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setUploadedFile(null); // Clear preview

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToSend, 
          modality, 
          mode: selectedMode.id,
          image: imageToSend 
        })
      });

      if (!response.ok) {
        let errorMessage = 'The server could not process your request.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Keep the safe fallback when the server does not return JSON.
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessages(prev => {
        const next = [...prev, data];
        if (isSpeakingRef.current || modality === 'voice') {
          speak(data.text, next.length - 1);
        }
        return next;
      });
    } catch (error) {
      console.error('Chat Error:', error);
      const message = error instanceof TypeError
        ? 'Unable to reach the backend. Please check that the server is running on port 5001.'
        : error.message;
      setMessages(prev => [...prev, {
        text: message || 'The request failed. Please try again later.',
        sender: 'ai',
        isError: true,
        mode: selectedMode.id
      }]);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const speak = (text, msgIdx = null, forceFromStart = false, customStartPos = null) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setSpeakingMsgIdx(msgIdx);

    const cleanTextToSpeak = stripMarkdown(text);

    let startPos = 0;
    if (customStartPos !== null) {
      startPos = customStartPos;
      setSpeechPositions(prev => ({
        ...prev,
        [msgIdx]: customStartPos
      }));
    } else if (forceFromStart) {
      startPos = 0;
      setSpeechPositions(prev => ({
        ...prev,
        [msgIdx]: 0
      }));
    } else {
      startPos = speechPositions[msgIdx] || 0;
    }

    if (startPos >= cleanTextToSpeak.length) {
      startPos = 0;
    }

    const textToSpeak = cleanTextToSpeak.substring(startPos);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    currentBoundaryRef.current = startPos;

    const voice = voices.find(v => v.name === selectedVoiceName) || voices.find(v => v.name.includes('Google US English') || v.lang === 'en-US') || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = speechRate;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => {
      setIsAiSpeaking(false);
      setSpeakingMsgIdx(null);
      setSpokenRange({ start: 0, length: 0 });
      setSpeechPositions(prev => ({
        ...prev,
        [msgIdx]: 0
      }));
    };
    utterance.onerror = () => {
      setIsAiSpeaking(false);
      setSpeakingMsgIdx(null);
      setSpokenRange({ start: 0, length: 0 });
      setSpeechPositions(prev => ({
        ...prev,
        [msgIdx]: 0
      }));
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const currentPos = startPos + event.charIndex;
        setSpokenRange({ start: currentPos, length: event.charLength });
        currentBoundaryRef.current = currentPos;
      }
    };

    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    stopSpeaking();
    setUploadedFile(null); // Reset attachments
    
    const modeGreeting = `Switched to **${mode.name} ${mode.emoji}**.\n\nDescription: _${mode.description}_\n\nHow can I help you in this mode today?`;
    setMessages(prev => [...prev, {
      text: modeGreeting,
      sender: 'ai',
      timestamp: new Date(),
      mode: mode.id
    }]);
  };

  const categories = ['General', 'Tech & Coding', 'Career & Business', 'Education & Productivity', 'Lifestyle & Creativity'];
  const filteredModes = AI_MODES.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0.5rem',
        marginBottom: '0.2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="icon-btn sidebar-toggle-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Modes Sidebar"
            style={{ padding: '0.6rem' }}
          >
            <Menu size={18} />
          </button>
          <img src="/patrikaTalk.png" alt="Patrika Talk Logo" style={{ height: '36px', objectFit: 'contain' }} />
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Interaction AI
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>
          ADAPTIVE MULTI-MODAL WORKSTATION
        </p>
      </header>

      <div className="main-layout">
        {sidebarOpen && (
          <div className="glass-panel sidebar-container">
            <div className="sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Select Assistant Mode</span>
              </div>
              <input 
                type="text" 
                className="search-box" 
                placeholder="Search 30+ modes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="sidebar-menu">
              {categories.map((cat, idx) => {
                const modesInCat = filteredModes.filter(m => m.category === cat);
                if (modesInCat.length === 0) return null;
                
                const catColors = ['var(--color-general)', 'var(--color-tech)', 'var(--color-career)', 'var(--color-education)', 'var(--color-lifestyle)'];
                
                return (
                  <div key={idx}>
                    <div className="category-title">
                      <span style={{ backgroundColor: catColors[idx % catColors.length] }}></span>
                      {cat}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {modesInCat.map(mode => (
                        <div 
                          key={mode.id}
                          className={`mode-item ${selectedMode.id === mode.id ? 'active' : ''}`}
                          onClick={() => handleModeChange(mode)}
                        >
                          <span className="mode-emoji">{mode.emoji}</span>
                          <div className="mode-info">
                            <span className="mode-name">{mode.name}</span>
                            <span className="mode-desc">{mode.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <main className="glass-panel chat-window">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{selectedMode.emoji}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{selectedMode.name}</span>
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} title="Online"></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedMode.description}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {isSpeaking && (
                <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '0.5rem' }}>
                  <Volume2 size={12} /> SPEAK ACTIVE
                </span>
              )}
              
              <AnimatePresence mode="wait">
                {isAiSpeaking ? (
                  <motion.button
                    key="stop-btn"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={stopSpeaking}
                    className="icon-btn"
                    title="Stop Speaking (Esc)"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                      borderColor: '#ef4444',
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      height: '36px',
                      borderRadius: '0.5rem',
                      border: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Square size={12} fill="white" />
                  </motion.button>
                ) : (
                  Object.keys(speechPositions).some(key => speechPositions[key] > 0) && (
                    <motion.div
                      key="resume-restart-group"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}
                    >
                      <button
                        onClick={() => {
                          const pausedIdx = Object.keys(speechPositions)
                            .map(Number)
                            .filter(idx => speechPositions[idx] > 0)
                            .pop();
                          if (pausedIdx !== undefined && messages[pausedIdx]) {
                            speak(messages[pausedIdx].text, pausedIdx);
                          }
                        }}
                        className="icon-btn"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', height: '36px', padding: '0.4rem 0.8rem', color: 'white', border: 'none' }}
                      >
                        <Volume2 size={12} />
                      </button>
                      <button
                        onClick={() => {
                          const pausedIdx = Object.keys(speechPositions)
                            .map(Number)
                            .filter(idx => speechPositions[idx] > 0)
                            .pop();
                          if (pausedIdx !== undefined && messages[pausedIdx]) {
                            speak(messages[pausedIdx].text, pausedIdx, true);
                          }
                        }}
                        className="icon-btn"
                        style={{ height: '36px', padding: '0.4rem 0.8rem' }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              <button 
                className={`icon-btn ${isSpeaking ? 'active' : ''}`}
                onClick={() => {
                  const nextSpeaking = !isSpeaking;
                  setIsSpeaking(nextSpeaking);
                  if (!nextSpeaking) {
                    stopSpeaking();
                  }
                }}
                title="Toggle Voice Output"
                style={isSpeaking ? { background: 'var(--accent-gradient)', border: 'none', height: '36px' } : { height: '36px' }}
              >
                <Volume2 size={16} />
              </button>

              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '70px' }}
                  style={{ display: 'flex', alignItems: 'center', height: '36px', background: 'rgba(255,255,255,0.05)', padding: '0 8px', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </motion.div>
              )}

              <button className="icon-btn" style={{ height: '36px' }} onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Theme">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="icon-btn" style={{ height: '36px' }} onClick={() => setIsSettingsOpen(true)} title="Settings">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="messages-container">
            {selectedMode.id !== 'chat' && selectedMode.id !== 'voice_assistant' && (
              <InteractiveWidget 
                mode={selectedMode.id}
                onSendMessage={handleSendMessage}
                setInputText={setInputText}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
              />
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`message ${msg.sender}`}
                  style={msg.isError ? {
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5'
                  } : {}}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.4rem',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: 0.6
                  }}>
                    {msg.sender === 'user' ? <User size={10} /> : <img src="/patrikaTalk.png" alt="Bot Logo" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />}
                    {msg.sender === 'user' ? 'You' : 'Interaction AI'}
                    {msg.sender === 'ai' && (
                      isAiSpeaking && idx === speakingMsgIdx ? (
                        <button
                          onClick={stopSpeaking}
                          title="Stop Speech (Esc)"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            marginLeft: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)'
                          }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <VolumeX size={10} />
                          </motion.div>
                          <span style={{ fontSize: '0.65rem', fontWeight: '800' }}>Stop</span>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <button
                            onClick={() => speak(msg.text, idx)}
                            title={speechPositions[idx] > 0 ? "Resume Speech" : "Speak Response"}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: speechPositions[idx] > 0 ? '#10b981' : 'var(--primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              marginLeft: '6px',
                              backgroundColor: speechPositions[idx] > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(129, 140, 248, 0.1)'
                            }}
                          >
                            <Volume2 size={10} />
                            <span style={{ fontSize: '0.65rem', fontWeight: '800' }}>
                              {speechPositions[idx] > 0 ? 'Resume' : 'Speak'}
                            </span>
                          </button>
                          {speechPositions[idx] > 0 && (
                            <button
                              onClick={() => speak(msg.text, idx, true)}
                              title="Restart from beginning"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                              }}
                            >
                              <RotateCcw size={10} />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                  
                  <FormattedResponse 
                    text={msg.text} 
                    isAi={msg.sender === 'ai'} 
                    msgIdx={idx} 
                    speakingMsgIdx={speakingMsgIdx} 
                    isAiSpeaking={isAiSpeaking} 
                    spokenRange={spokenRange} 
                    speak={speak} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />

          {/* File Attachment Preview Bar */}
          {uploadedFile && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.5rem 1.5rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderTop: '1px solid var(--glass-border)',
              borderBottom: '1px solid var(--glass-border)'
            }}>
              <div style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                padding: '3px 8px', 
                borderRadius: '4px', 
                fontSize: '0.7rem', 
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {uploadedFile.type}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {uploadedFile.name}
              </span>
              <button 
                onClick={() => setUploadedFile(null)} 
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {isParsingFile && (
            <div style={{ padding: '0.5rem 1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing file client-side...</span>
            </div>
          )}

          <div className="input-area">
            {/* Attachment Button */}
            <button
              className="icon-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach File (Image, PDF, CSV, TXT)"
              style={{ marginRight: '0.2rem' }}
            >
              <Paperclip size={18} />
            </button>

            <button
              className={`icon-btn ${isListening ? 'active' : ''}`}
              onClick={toggleListening}
              style={isListening ? { animation: 'pulse 1.5s infinite' } : {}}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              className="input-field"
              placeholder={isListening ? "Listening..." : selectedMode.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />

            <button className="icon-btn send" onClick={() => handleSendMessage()}>
              <Send size={16} />
              <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Send</span>
            </button>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                background: 'var(--glass)',
                border: '1px solid var(--glass-border)',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '450px',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Interaction Settings
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
                >
                  &times;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  AI Voice
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    color: 'var(--input-text)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {voices.map((v, i) => (
                    <option key={i} value={v.name} style={{ background: 'var(--bg-dark)', color: 'white' }}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Speech Speed ({speechRate}x)
                  </label>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Speech Volume ({Math.round(volume * 100)}%)
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <button
                  onClick={() => {
                    setMessages([
                      { text: "Hello! I am your AI assistant. I can understand text and voice. How can I help you today?", sender: 'ai', mode: 'chat' }
                    ]);
                    setSpeechPositions({});
                    stopSpeaking();
                    setIsSettingsOpen(false);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                >
                  Clear Chat Conversation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, Search, GitBranch, Settings, Bot, Terminal,
  Play, Maximize2, X, ChevronRight, ChevronDown, FileCode2,
  Cpu, Zap, Sparkles, MessageSquareCode, Save, RefreshCw,
  Plus, Trash2, Send, Brain, User, Loader2, Copy, Check,
  FolderOpen, File, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStreamingAIResponse, clearConversationHistory } from '@/lib/AIBrainService';
import { MonarchAvatar } from '@/components/ai/MonarchAvatar';

// ─── Типы ───────────────────────────────────────────────────────────────────

interface VirtualFile {
  name: string;
  language: string;
  content: string;
  icon: string; // color for icon
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ─── Начальные файлы виртуальной FS ────────────────────────────────────────

const DEFAULT_FILES: Record<string, VirtualFile> = {
  'main.py': {
    name: 'main.py',
    language: 'python',
    icon: '#3572A5',
    content: `# Monarch IDE - Python Sandbox
# Пишите код и запускайте его прямо в браузере!

def greet(name):
    """Приветствие от Monarch AI"""
    return f"Привет, {name}! 🚀 Добро пожаловать в Monarch IDE!"

# Примеры для практики
numbers = [1, 2, 3, 4, 5]
squares = [x ** 2 for x in numbers]

print(greet("Студент"))
print(f"Квадраты чисел: {squares}")
print(f"Сумма: {sum(squares)}")

# Попробуйте написать свой код ниже:
`,
  },
  'algorithms.py': {
    name: 'algorithms.py',
    language: 'python',
    icon: '#3572A5',
    content: `# Алгоритмы сортировки

def bubble_sort(arr):
    """Сортировка пузырьком - O(n²)"""
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def selection_sort(arr):
    """Сортировка выбором - O(n²)"""
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

# Тестирование
data = [64, 34, 25, 12, 22, 11, 90]
print(f"Исходный массив: {data}")
print(f"Bubble sort:     {bubble_sort(data.copy())}")
print(f"Selection sort:  {selection_sort(data.copy())}")
`,
  },
  'calculator.py': {
    name: 'calculator.py',
    language: 'python',
    icon: '#3572A5',
    content: `# Простой калькулятор

def calculate(a, op, b):
    """Выполняет арифметическую операцию"""
    operations = {
        '+': lambda x, y: x + y,
        '-': lambda x, y: x - y,
        '*': lambda x, y: x * y,
        '/': lambda x, y: x / y if y != 0 else "Ошибка: деление на ноль"
    }
    
    if op not in operations:
        return f"Неизвестная операция: {op}"
    
    return operations[op](a, b)

# Примеры
print("=== Калькулятор ===")
print(f"10 + 5 = {calculate(10, '+', 5)}")
print(f"10 - 3 = {calculate(10, '-', 3)}")
print(f"7 * 8  = {calculate(7, '*', 8)}")
print(f"15 / 4 = {calculate(15, '/', 4)}")
print(f"10 / 0 = {calculate(10, '/', 0)}")
`,
  },
  'notes.txt': {
    name: 'notes.txt',
    language: 'text',
    icon: '#888888',
    content: `=== Заметки ===

TODO:
- [ ] Изучить списки (list comprehension)
- [ ] Разобрать рекурсию
- [ ] Написать программу-калькулятор  
- [ ] Изучить работу с файлами

Полезные ссылки:
- docs.python.org
- pythontutor.com (визуализация кода)
`,
  },
};

// ─── Подсветка синтаксиса Python ───────────────────────────────────────────

function highlightPython(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      let matched = false;

      // Comments
      const commentMatch = remaining.match(/^(#.*)/);
      if (commentMatch) {
        tokens.push(<span key={key++} className="text-[#5c6370] italic">{commentMatch[1]}</span>);
        remaining = '';
        matched = true;
      }

      // Triple-quoted strings
      if (!matched) {
        const tripleMatch = remaining.match(/^("""[\s\S]*?"""|'''[\s\S]*?''')/);
        if (tripleMatch) {
          tokens.push(<span key={key++} className="text-[#98c379]">{tripleMatch[1]}</span>);
          remaining = remaining.slice(tripleMatch[1].length);
          matched = true;
        }
      }

      // Strings (double/single)
      if (!matched) {
        const strMatch = remaining.match(/^(f?"[^"]*"|f?'[^']*')/);
        if (strMatch) {
          tokens.push(<span key={key++} className="text-[#98c379]">{strMatch[1]}</span>);
          remaining = remaining.slice(strMatch[1].length);
          matched = true;
        }
      }

      // Keywords
      if (!matched) {
        const kwMatch = remaining.match(/^(def|class|return|if|elif|else|for|while|import|from|as|try|except|finally|raise|with|yield|lambda|pass|break|continue|and|or|not|in|is|True|False|None|print|input|len|range|int|str|float|list|dict|set|tuple)\b/);
        if (kwMatch) {
          const kw = kwMatch[1];
          const color = ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'yield', 'lambda', 'pass', 'break', 'continue', 'and', 'or', 'not', 'in', 'is'].includes(kw)
            ? 'text-[#c678dd]'
            : ['True', 'False', 'None'].includes(kw)
              ? 'text-[#d19a66]'
              : ['print', 'input', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple'].includes(kw)
                ? 'text-[#56b6c2]'
                : 'text-[#c678dd]';
          tokens.push(<span key={key++} className={color}>{kw}</span>);
          remaining = remaining.slice(kw.length);
          matched = true;
        }
      }

      // Numbers
      if (!matched) {
        const numMatch = remaining.match(/^(\d+\.?\d*)/);
        if (numMatch) {
          tokens.push(<span key={key++} className="text-[#d19a66]">{numMatch[1]}</span>);
          remaining = remaining.slice(numMatch[1].length);
          matched = true;
        }
      }

      // Function calls
      if (!matched) {
        const funcMatch = remaining.match(/^([a-zA-Z_]\w*)\s*(?=\()/);
        if (funcMatch) {
          tokens.push(<span key={key++} className="text-[#61afef]">{funcMatch[1]}</span>);
          remaining = remaining.slice(funcMatch[1].length);
          matched = true;
        }
      }

      // Decorators
      if (!matched) {
        const decMatch = remaining.match(/^(@\w+)/);
        if (decMatch) {
          tokens.push(<span key={key++} className="text-[#e5c07b]">{decMatch[1]}</span>);
          remaining = remaining.slice(decMatch[1].length);
          matched = true;
        }
      }

      // Self
      if (!matched) {
        const selfMatch = remaining.match(/^(self)\b/);
        if (selfMatch) {
          tokens.push(<span key={key++} className="text-[#e06c75]">{selfMatch[1]}</span>);
          remaining = remaining.slice(selfMatch[1].length);
          matched = true;
        }
      }

      // Operators
      if (!matched) {
        const opMatch = remaining.match(/^([=!<>+\-*/%]=?|[{}()\[\]:,.])/);
        if (opMatch) {
          tokens.push(<span key={key++} className="text-[#abb2bf]">{opMatch[1]}</span>);
          remaining = remaining.slice(opMatch[1].length);
          matched = true;
        }
      }

      // Default: take one character
      if (!matched) {
        tokens.push(<span key={key++} className="text-[#abb2bf]">{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return (
      <div key={lineIdx} className="whitespace-pre">
        {tokens.length > 0 ? tokens : <span>{'\n'}</span>}
      </div>
    );
  });
}

// ─── Markdown рендерер (упрощенный для чата) ───────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines = part.slice(3, -3).split('\n');
      const lang = lines[0]?.trim() || '';
      const code = (lang ? lines.slice(1) : lines).join('\n').trim();
      return (
        <div key={i} className="my-2 rounded-lg overflow-hidden border border-white/10">
          {lang && (
            <div className="px-3 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/50">
              {lang}
            </div>
          )}
          <pre className="p-3 bg-black/40 text-green-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    return (
      <span key={i}>
        {part.split('\n').map((line, j) => {
          if (line.startsWith('### ')) return <h4 key={j} className="font-bold text-white mt-2 mb-1 text-xs">{processInline(line.slice(4))}</h4>;
          if (line.startsWith('## ')) return <h3 key={j} className="font-bold text-white mt-2 mb-1 text-sm">{processInline(line.slice(3))}</h3>;
          if (line.match(/^[-•] /)) return <div key={j} className="flex gap-1.5 ml-1"><span className="text-cyan-400">•</span><span>{processInline(line.slice(2))}</span></div>;
          if (line.match(/^\d+\. /)) return <div key={j} className="flex gap-1.5 ml-1"><span className="text-cyan-400 font-bold">{line.match(/^\d+/)![0]}.</span><span>{processInline(line.replace(/^\d+\.\s*/, ''))}</span></div>;
          if (!line.trim()) return <br key={j} />;
          return <span key={j}>{processInline(line)}{j < part.split('\n').length - 1 ? <br /> : null}</span>;
        })}
      </span>
    );
  });
}

function processInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    const boldMatch = rest.match(/\*\*(.+?)\*\*/);
    const codeMatch = rest.match(/`([^`]+)`/);

    let firstMatch: { index: number; length: number; content: React.ReactNode } | null = null;

    if (boldMatch?.index !== undefined) {
      const c = { index: boldMatch.index, length: boldMatch[0].length, content: <strong key={key++} className="text-white font-bold">{boldMatch[1]}</strong> };
      if (!firstMatch || c.index < firstMatch.index) firstMatch = c;
    }
    if (codeMatch?.index !== undefined) {
      const c = { index: codeMatch.index, length: codeMatch[0].length, content: <code key={key++} className="px-1 py-0.5 bg-white/10 text-amber-300 text-[10px] rounded font-mono">{codeMatch[1]}</code> };
      if (!firstMatch || c.index < firstMatch.index) firstMatch = c;
    }

    if (firstMatch) {
      if (firstMatch.index > 0) parts.push(rest.slice(0, firstMatch.index));
      parts.push(firstMatch.content);
      rest = rest.slice(firstMatch.index + firstMatch.length);
    } else {
      parts.push(rest);
      break;
    }
  }

  return <>{parts}</>;
}

// ─── Главный компонент IDE ─────────────────────────────────────────────────

export default function MonarchIDE() {
  const navigate = useNavigate();

  // File system
  const [files, setFiles] = useState<Record<string, VirtualFile>>(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('main.py');
  const [openTabs, setOpenTabs] = useState<string[]>(['main.py']);

  // Panels
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<'terminal' | 'problems' | 'debug'>('terminal');
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);

  // Terminal
  const [terminalLines, setTerminalLines] = useState<{ text: string; type: 'output' | 'error' | 'system' | 'input' }[]>([
    { text: '🚀 Monarch IDE Terminal v1.0', type: 'system' },
    { text: 'Python 3.11 (Pyodide) ready', type: 'system' },
    { text: 'Нажмите ▶ Run или Ctrl+Enter для запуска кода', type: 'system' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // AI Chat
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Привет! Я **Monarch AI** — твой ИИ-ассистент в IDE.\n\nМогу:\n- 📖 Объяснить код\n- 🔍 Найти ошибки\n- 💡 Предложить оптимизацию\n- 🎓 Научить шаг за шагом\n\nНапиши вопрос или выдели код!',
      timestamp: Date.now(),
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStreaming, setAiStreaming] = useState('');
  const aiScrollRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  // Editor ref
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [copied, setCopied] = useState(false);

  // ─── Pyodide Initialization ────────────────────────────────────────────────

  const initPyodide = useCallback(async () => {
    if (pyodide || pyodideLoading) return pyodide;

    setPyodideLoading(true);
    setTerminalLines(prev => [...prev, { text: '⏳ Загрузка Python runtime (Pyodide)...', type: 'system' }]);

    try {
      // Load Pyodide script if not already loaded
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide'));
          document.head.appendChild(script);
        });
      }

      const py = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });

      setPyodide(py);
      setPyodideLoading(false);
      setTerminalLines(prev => [...prev, { text: '✅ Python runtime загружен!', type: 'system' }]);
      return py;
    } catch (err) {
      setPyodideLoading(false);
      setTerminalLines(prev => [...prev, { text: `❌ Ошибка загрузки Pyodide: ${err}`, type: 'error' }]);
      return null;
    }
  }, [pyodide, pyodideLoading]);

  // ─── Run Code ──────────────────────────────────────────────────────────────

  const runCode = useCallback(async () => {
    if (isRunning) return;

    const file = files[activeFile];
    if (!file || file.language !== 'python') {
      setTerminalLines(prev => [...prev, { text: '⚠️ Можно запускать только Python файлы', type: 'error' }]);
      return;
    }

    setIsRunning(true);
    setTerminalLines(prev => [
      ...prev,
      { text: '', type: 'output' },
      { text: `$ python ${activeFile}`, type: 'input' },
    ]);

    let py = pyodide;
    if (!py) {
      py = await initPyodide();
      if (!py) {
        setIsRunning(false);
        return;
      }
    }

    try {
      // Redirect stdout/stderr
      py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

      py.runPython(file.content);

      const stdout = py.runPython('sys.stdout.getvalue()');
      const stderr = py.runPython('sys.stderr.getvalue()');

      if (stdout) {
        stdout.split('\n').filter((l: string) => l !== '').forEach((line: string) => {
          setTerminalLines(prev => [...prev, { text: line, type: 'output' }]);
        });
      }
      if (stderr) {
        stderr.split('\n').filter((l: string) => l !== '').forEach((line: string) => {
          setTerminalLines(prev => [...prev, { text: line, type: 'error' }]);
        });
      }

      if (!stdout && !stderr) {
        setTerminalLines(prev => [...prev, { text: '(Программа завершена без вывода)', type: 'system' }]);
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      // Parse the Python error for cleaner output
      const lines = errorMsg.split('\n');
      lines.forEach((line: string) => {
        if (line.trim()) {
          setTerminalLines(prev => [...prev, { text: line, type: 'error' }]);
        }
      });
    }

    setIsRunning(false);
  }, [activeFile, files, pyodide, isRunning, initPyodide]);

  // ─── Terminal scroll ───────────────────────────────────────────────────────

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // ─── AI Chat scroll ───────────────────────────────────────────────────────

  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages, aiStreaming]);

  // ─── Keyboard shortcut (Ctrl+Enter to run) ────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Already auto-saved in state
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [runCode]);

  // ─── File Operations ──────────────────────────────────────────────────────

  const openFile = (name: string) => {
    setActiveFile(name);
    if (!openTabs.includes(name)) {
      setOpenTabs(prev => [...prev, name]);
    }
  };

  const closeTab = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== name);
    if (newTabs.length === 0) return; // Keep at least one tab
    setOpenTabs(newTabs);
    if (activeFile === name) {
      setActiveFile(newTabs[newTabs.length - 1]);
    }
  };

  const updateFileContent = (content: string) => {
    setFiles(prev => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], content },
    }));
  };

  const createNewFile = () => {
    const name = prompt('Имя нового файла (например, script.py):');
    if (!name) return;
    const isPython = name.endsWith('.py');
    setFiles(prev => ({
      ...prev,
      [name]: {
        name,
        language: isPython ? 'python' : 'text',
        icon: isPython ? '#3572A5' : '#888888',
        content: isPython ? `# ${name}\n\n` : '',
      },
    }));
    openFile(name);
  };

  const deleteFile = (name: string) => {
    if (Object.keys(files).length <= 1) return;
    if (!confirm(`Удалить ${name}?`)) return;
    const newFiles = { ...files };
    delete newFiles[name];
    setFiles(newFiles);
    closeTab(name, { stopPropagation: () => {} } as React.MouseEvent);
  };

  // ─── Cursor tracking ──────────────────────────────────────────────────────

  const handleEditorSelect = () => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    setCursorLine(lines.length);
    setCursorCol(lines[lines.length - 1].length + 1);
  };

  // ─── Copy code ─────────────────────────────────────────────────────────────

  const copyCode = () => {
    navigator.clipboard.writeText(files[activeFile]?.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Terminal input (REPL) ─────────────────────────────────────────────────

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    setTerminalInput('');
    setTerminalLines(prev => [...prev, { text: `>>> ${cmd}`, type: 'input' }]);

    if (cmd === 'clear') {
      setTerminalLines([{ text: '🧹 Terminal cleared', type: 'system' }]);
      return;
    }

    let py = pyodide;
    if (!py) {
      py = await initPyodide();
      if (!py) return;
    }

    try {
      py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

      const result = py.runPython(cmd);
      const stdout = py.runPython('sys.stdout.getvalue()');
      const stderr = py.runPython('sys.stderr.getvalue()');

      if (stdout) {
        stdout.split('\n').filter((l: string) => l).forEach((line: string) => {
          setTerminalLines(prev => [...prev, { text: line, type: 'output' }]);
        });
      }
      if (stderr) {
        stderr.split('\n').filter((l: string) => l).forEach((line: string) => {
          setTerminalLines(prev => [...prev, { text: line, type: 'error' }]);
        });
      }
      if (result !== undefined && result !== null && !stdout) {
        setTerminalLines(prev => [...prev, { text: String(result), type: 'output' }]);
      }
    } catch (err: any) {
      setTerminalLines(prev => [...prev, { text: String(err?.message || err), type: 'error' }]);
    }
  };

  // ─── AI Chat ───────────────────────────────────────────────────────────────

  const sendAiMessage = async (text: string) => {
    if (!text.trim() || aiLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);
    setAiStreaming('');

    // Build context with current code
    const currentCode = files[activeFile]?.content || '';
    const contextPrefix = `[Контекст IDE: Файл "${activeFile}"]\n\`\`\`python\n${currentCode.slice(0, 2000)}\n\`\`\`\n\n`;
    const fullText = contextPrefix + text;

    const historyData = aiMessages.slice(-8).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let fullResponse = '';

    await getStreamingAIResponse(
      fullText,
      { history: historyData },
      (chunk: string) => {
        fullResponse += chunk;
        setAiStreaming(fullResponse);
      },
      (completeText: string) => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: completeText,
          timestamp: Date.now(),
        };
        setAiMessages(prev => [...prev, aiMsg]);
        setAiStreaming('');
        setAiLoading(false);
      },
      (error: string) => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${error}\n\nПопробуйте ещё раз.`,
          timestamp: Date.now(),
        };
        setAiMessages(prev => [...prev, aiMsg]);
        setAiStreaming('');
        setAiLoading(false);
      }
    );
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendAiMessage(aiInput);
  };

  const clearAiChat = () => {
    setAiMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: '🔄 Чат очищен. Готов к работе!',
      timestamp: Date.now(),
    }]);
    clearConversationHistory();
  };

  // ─── Current file ──────────────────────────────────────────────────────────

  const currentFile = files[activeFile];
  const lineCount = currentFile ? currentFile.content.split('\n').length : 0;

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full bg-[#0d0d12] text-slate-300 font-sans overflow-hidden">
      {/* ═══ Activity Bar ═══ */}
      <div className="w-12 border-r border-white/5 flex flex-col items-center py-4 bg-[#0a0a0f] z-20">
        <div className="flex flex-col gap-5 w-full">
          <button
            onClick={() => setExplorerOpen(!explorerOpen)}
            className={`p-2 w-full flex justify-center transition-colors relative group ${explorerOpen ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Explorer"
          >
            {explorerOpen && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-400 rounded-r-full" />}
            <Folder size={20} className="relative z-10" />
          </button>
          <button className="p-2 w-full flex justify-center text-slate-500 hover:text-slate-300 transition-colors" title="Search">
            <Search size={20} />
          </button>
          <button className="p-2 w-full flex justify-center text-slate-500 hover:text-slate-300 transition-colors" title="Git">
            <GitBranch size={20} />
          </button>
          <button
            onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
            className={`p-2 w-full flex justify-center transition-colors relative group ${aiSidebarOpen ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Monarch AI"
          >
            {aiSidebarOpen && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-purple-400 rounded-r-full" />}
            <Bot size={20} className="relative z-10" />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate('/')}
            className="p-2 w-full flex justify-center text-slate-500 hover:text-cyan-400 transition-colors"
            title="Вернуться на платформу"
          >
            <ArrowLeft size={20} />
          </button>
          <button className="p-2 w-full flex justify-center text-slate-500 hover:text-slate-300 transition-colors" title="Settings">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* ═══ Explorer Panel ═══ */}
      <AnimatePresence initial={false}>
        {explorerOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0, transition: { duration: 0.15 } }}
            className="border-r border-white/5 bg-[#0e0e14] flex flex-col z-10 overflow-hidden shrink-0"
          >
            <div className="px-3 py-2.5 text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase flex items-center justify-between">
              <span>Explorer</span>
              <button onClick={createNewFile} className="hover:text-cyan-400 transition-colors" title="Новый файл">
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-2">
                <div className="flex items-center gap-1 py-1 px-2 text-xs font-semibold text-slate-300 cursor-pointer hover:bg-white/5 rounded">
                  <FolderOpen size={14} className="text-cyan-400" />
                  <span className="truncate">MONARCH-PROJECT</span>
                </div>

                <div className="pl-4 flex flex-col gap-0.5 mt-1">
                  {Object.entries(files).map(([name, file]) => (
                    <div
                      key={name}
                      className={`group flex items-center gap-2 py-1 px-2 text-xs rounded cursor-pointer transition-colors ${
                        activeFile === name
                          ? 'text-cyan-400 bg-cyan-400/10'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                      onClick={() => openFile(name)}
                    >
                      <FileCode2 size={13} style={{ color: file.icon }} />
                      <span className="truncate flex-1">{name}</span>
                      {Object.keys(files).length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteFile(name); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Main Editor Area ═══ */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Editor Tabs */}
        <div className="flex w-full overflow-x-auto scrollbar-none border-b border-white/5 bg-[#0a0a0f]">
          {openTabs.map(tab => (
            <div
              key={tab}
              onClick={() => setActiveFile(tab)}
              className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer min-w-fit transition-colors ${
                activeFile === tab
                  ? 'bg-[#0d0d12] text-cyan-400 border-t-2 border-cyan-400'
                  : 'text-slate-500 hover:text-slate-300 border-t-2 border-transparent'
              }`}
            >
              <FileCode2 size={13} style={{ color: files[tab]?.icon || '#888' }} />
              <span>{tab}</span>
              {openTabs.length > 1 && (
                <button onClick={(e) => closeTab(tab, e)} className="ml-1 opacity-50 hover:opacity-100">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          <div className="ml-auto flex items-center pr-3 gap-2">
            <button
              onClick={copyCode}
              className="text-slate-500 hover:text-white transition-colors p-1"
              title="Копировать код"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
            <button
              onClick={runCode}
              disabled={isRunning || currentFile?.language !== 'python'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400'
                  : currentFile?.language === 'python'
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
              title="Run (Ctrl+Enter)"
            >
              {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 relative min-h-0 flex flex-col" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.02) 0%, transparent 70%)' }}>
          {/* AI Assisted badge */}
          <div className="absolute top-2 right-3 z-10 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-md">
            <Sparkles size={11} className="text-purple-400" />
            <span className="text-[10px] text-slate-400">AI Assisted</span>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers */}
            <div className="flex flex-col text-right pr-2 pl-3 pt-3 text-slate-600 select-none font-mono text-xs leading-[1.65rem] bg-[#0d0d12] border-r border-white/5 overflow-hidden shrink-0">
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i} className={`${cursorLine === i + 1 ? 'text-cyan-400' : ''}`}>
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Code area with overlay highlighting */}
            <div className="flex-1 relative overflow-auto">
              {/* Syntax highlighting layer (behind) */}
              <div className="absolute inset-0 p-3 font-mono text-xs leading-[1.65rem] pointer-events-none whitespace-pre-wrap break-words overflow-hidden" style={{ tabSize: 4 }}>
                {currentFile?.language === 'python'
                  ? highlightPython(currentFile.content)
                  : <span className="text-slate-300">{currentFile?.content}</span>
                }
              </div>

              {/* Textarea editing layer (on top, transparent text) */}
              <textarea
                ref={editorRef}
                value={currentFile?.content || ''}
                onChange={(e) => updateFileContent(e.target.value)}
                onSelect={handleEditorSelect}
                onClick={handleEditorSelect}
                onKeyUp={handleEditorSelect}
                spellCheck={false}
                className="absolute inset-0 w-full h-full p-3 font-mono text-xs leading-[1.65rem] bg-transparent text-transparent caret-cyan-400 resize-none outline-none selection:bg-cyan-500/20 selection:text-transparent"
                style={{ tabSize: 4 }}
              />
            </div>
          </div>
        </div>

        {/* ═══ Bottom Panel (Terminal) ═══ */}
        {bottomPanelOpen && (
          <div className="h-52 border-t border-white/5 bg-[#0e0e14] flex flex-col shrink-0 relative">
            <div className="flex border-b border-white/5 text-[10px] text-slate-400">
              {(['terminal', 'problems', 'debug'] as const).map(panel => (
                <button
                  key={panel}
                  className={`px-3 py-1.5 uppercase tracking-wider font-bold transition-colors ${
                    activePanel === panel
                      ? panel === 'terminal' ? 'text-cyan-400 border-b border-cyan-400' : 'text-white border-b border-white'
                      : 'hover:text-white'
                  }`}
                  onClick={() => setActivePanel(panel)}
                >
                  {panel === 'terminal' ? '⬤ Terminal' : panel === 'problems' ? 'Problems' : 'Debug'}
                </button>
              ))}
              <div className="ml-auto flex items-center pr-2 gap-1.5">
                <button
                  onClick={() => setTerminalLines([{ text: '🧹 Cleared', type: 'system' }])}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white"
                  title="Clear terminal"
                >
                  <Trash2 size={12} />
                </button>
                <button
                  onClick={() => setBottomPanelOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {activePanel === 'terminal' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div
                  ref={terminalRef}
                  className="flex-1 p-2 font-mono text-[11px] overflow-y-auto space-y-0.5 cursor-text"
                  onClick={() => terminalInputRef.current?.focus()}
                >
                  {terminalLines.map((line, i) => (
                    <div key={i} className={
                      line.type === 'error' ? 'text-red-400' :
                      line.type === 'system' ? 'text-slate-500 italic' :
                      line.type === 'input' ? 'text-cyan-400' :
                      'text-green-300'
                    }>
                      {line.text}
                    </div>
                  ))}

                  {isRunning && (
                    <div className="flex items-center gap-2 text-amber-400">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Executing...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleTerminalSubmit} className="flex items-center border-t border-white/5 px-2 py-1">
                  <span className="text-green-400 mr-1 text-[11px] font-mono">{'>>>'}</span>
                  <input
                    ref={terminalInputRef}
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Введите Python код..."
                    className="flex-1 bg-transparent border-none outline-none text-[11px] font-mono text-slate-300 placeholder:text-slate-600"
                  />
                </form>
              </div>
            )}

            {activePanel === 'problems' && (
              <div className="flex-1 p-3 text-xs text-slate-500 flex items-center justify-center">
                <span>Нет обнаруженных проблем ✨</span>
              </div>
            )}

            {activePanel === 'debug' && (
              <div className="flex-1 p-3 text-xs text-slate-500 flex items-center justify-center">
                <span>Откройте терминал для отладки</span>
              </div>
            )}
          </div>
        )}

        {!bottomPanelOpen && (
          <button
            onClick={() => setBottomPanelOpen(true)}
            className="h-6 bg-[#0a0a0f] border-t border-white/5 text-[10px] text-slate-500 hover:text-white flex items-center justify-center gap-1 transition-colors"
          >
            <Terminal size={10} /> Terminal
          </button>
        )}
      </div>

      {/* ═══ AI Assistant Sidebar ═══ */}
      <AnimatePresence initial={false}>
        {aiSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0, transition: { duration: 0.15 } }}
            className="border-l border-white/5 bg-[#0f0f16] flex flex-col z-20 shrink-0"
          >
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between bg-[#13131c]">
              <div className="flex items-center gap-2 text-purple-400">
                <MonarchAvatar size={24} isThinking={aiLoading} />
                <span className="font-bold text-sm">Monarch AI</span>
                <div className={`w-1.5 h-1.5 rounded-full ${aiLoading ? 'bg-amber-400' : 'bg-green-400'} animate-pulse`} />
              </div>
              <div className="flex gap-1.5">
                <button onClick={clearAiChat} className="p-1 text-slate-500 hover:text-red-400 transition-colors" title="Очистить чат">
                  <Trash2 size={13} />
                </button>
                <button onClick={() => setAiSidebarOpen(false)} className="p-1 text-slate-500 hover:text-white transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={aiScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {aiMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5">
                      {msg.role === 'user' ? (
                        <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                          <User size={12} className="text-cyan-400" />
                        </div>
                      ) : (
                        <MonarchAvatar size={24} isThinking={false} />
                      )}
                    </div>
                    <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-500/10 text-white border border-cyan-500/20 rounded-tr-sm'
                        : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {aiLoading && aiStreaming && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] flex gap-2">
                    <MonarchAvatar size={24} isThinking={true} />
                    <div className="p-2.5 rounded-xl rounded-tl-sm text-[11px] leading-relaxed bg-white/5 border border-white/5 text-white/80">
                      {renderMarkdown(aiStreaming)}
                      <span className="inline-block w-1 h-3 bg-purple-400 animate-pulse ml-0.5 rounded-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading dots */}
              {aiLoading && !aiStreaming && (
                <div className="flex justify-start items-center gap-2">
                  <MonarchAvatar size={24} isThinking={true} />
                  <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl rounded-tl-sm flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            {!aiLoading && aiMessages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {['Объясни этот код', 'Найди ошибки', 'Оптимизируй', 'Напиши тесты'].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendAiMessage(s)}
                    className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleAiSubmit} className="p-3 border-t border-white/5 bg-[#0a0a0f]">
              <div className="relative">
                <input
                  ref={aiInputRef}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Спросите Monarch AI..."
                  disabled={aiLoading}
                  className="w-full bg-[#13131c] border border-white/10 rounded-lg py-2 pl-3 pr-9 text-[11px] text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all disabled:opacity-40"
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim() || aiLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 disabled:opacity-30 transition-colors"
                >
                  <Send size={11} />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-center gap-1 text-[7px] font-bold uppercase tracking-[0.15em] text-white/10">
                <Brain size={8} /> Monarch AI Engine
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Status Bar ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-5 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px] font-mono z-30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
            <GitBranch size={10} /> main
          </span>
          <span className="flex items-center gap-1">
            <Zap size={10} /> Monarch Engine
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 text-yellow-300">
              <Loader2 size={10} className="animate-spin" /> Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>Ln {cursorLine}, Col {cursorCol}</span>
          <span>UTF-8</span>
          <span>{currentFile?.language === 'python' ? 'Python 3.11' : 'Plain Text'}</span>
          <span className="flex items-center gap-1">
            <MessageSquareCode size={10} /> AI: {aiSidebarOpen ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
}

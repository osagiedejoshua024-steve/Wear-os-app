import React, { useState } from 'react';
import { CODE_DELIVERABLES, CodeFile } from '../data/codeDeliverables';
import {
  Code,
  Copy,
  Check,
  Search,
  FileCode,
  Download,
  FolderGit2,
  Cpu,
  Layers,
  Shield,
  Smartphone,
  Watch,
} from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(CODE_DELIVERABLES[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedFile =
    CODE_DELIVERABLES.find((f) => f.id === selectedFileId) || CODE_DELIVERABLES[0];

  const filteredFiles = CODE_DELIVERABLES.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || f.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (category: CodeFile['category']) => {
    switch (category) {
      case 'wear_os':
        return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Wear OS (Kotlin)</span>;
      case 'watch_os':
        return <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">watchOS (Swift)</span>;
      case 'android_companion':
        return <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">Android Service</span>;
      case 'ios_companion':
        return <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">iOS Companion</span>;
      case 'flutter_engine':
        return <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">Flutter / Dart</span>;
      case 'security_specs':
        return <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">Security Specs</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Production Code Deliverables Repository
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-stack implementation files for Wear OS, watchOS, Android, iOS, Flutter, and Hardware KeyStore/Enclave.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setFilterCategory('wear_os')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'wear_os'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wear OS
          </button>
          <button
            onClick={() => setFilterCategory('watch_os')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'watch_os'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            watchOS
          </button>
          <button
            onClick={() => setFilterCategory('android_companion')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'android_companion'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setFilterCategory('ios_companion')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'ios_companion'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            iOS
          </button>
          <button
            onClick={() => setFilterCategory('flutter_engine')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'flutter_engine'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Flutterwave Dart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* File Navigator Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* File List */}
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedFileId === file.id
                    ? 'bg-slate-800 border-emerald-500/50 shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    {file.name}
                  </span>
                  {getCategoryBadge(file.category)}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {file.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
          {/* File Action Bar */}
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({selectedFile.language.toUpperCase()})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Syntax Display */}
          <div className="p-4 overflow-x-auto max-h-[540px] text-xs font-mono text-slate-200 leading-relaxed bg-[#0b101b]">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

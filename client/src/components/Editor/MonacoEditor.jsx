
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import { CollaborationService } from '../../services/collaboration';
import { getLanguageFromFilename } from '../../utils/languageDetection';

export const MonacoEditor = ({
  projectId,
  file,
  user,
  onContentChange,
  onSave,
  onConnectionStatusChange,
  onOnlineUsersChange
}) => {
  const editorRef = useRef(null);
  const bindingRef = useRef(null);
  const collabRef = useRef(null);
  const contentListenerRef = useRef(null);

  const language = file
    ? getLanguageFromFilename(file.name)
    : 'javascript';

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register custom dark pink editor theme
    monaco.editor.defineTheme('pink-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '98758A', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FF79C6' },
        { token: 'string', foreground: 'F5A6C8' },
        { token: 'number', foreground: 'FFB86C' },
        { token: 'regexp', foreground: 'F78FB3' },
        { token: 'type', foreground: 'F0A6CA' },
        { token: 'type.identifier', foreground: 'F0A6CA' },
        { token: 'function', foreground: 'FF8FC7' },
        { token: 'identifier', foreground: 'F8EAF2' },
        { token: 'delimiter', foreground: 'D8B8CB' },
        { token: 'operator', foreground: 'FF79C6' },
        { token: 'constant', foreground: 'FFB86C' },
        { token: 'variable', foreground: 'F8EAF2' }
      ],
      colors: {
        'editor.background': '#1F1018',
        'editor.foreground': '#F8EAF2',
        'editorLineNumber.foreground': '#80566D',
        'editorLineNumber.activeForeground': '#FF8FC7',
        'editorCursor.foreground': '#FF79C6',
        'editor.selectionBackground': '#71365380',
        'editor.inactiveSelectionBackground': '#71365345',
        'editor.lineHighlightBackground': '#35202D',
        'editorLineHighlightBorder': '#00000000',
        'editorIndentGuide.background1': '#49303D',
        'editorIndentGuide.activeBackground1': '#A85D84',
        'editorWhitespace.foreground': '#49303D',
        'editorGutter.background': '#1F1018',
        'editorWidget.background': '#2D1B26',
        'editorWidget.border': '#713653',
        'editorSuggestWidget.background': '#2D1B26',
        'editorSuggestWidget.border': '#713653',
        'editorSuggestWidget.foreground': '#F8EAF2',
        'editorSuggestWidget.selectedBackground': '#713653',
        'editorHoverWidget.background': '#2D1B26',
        'editorHoverWidget.border': '#713653',
        'scrollbarSlider.background': '#71365370',
        'scrollbarSlider.hoverBackground': '#A85D8490',
        'scrollbarSlider.activeBackground': '#C86BA0A0',
        'minimap.background': '#1F1018',
        'focusBorder': '#E879B9'
      }
    });

    monaco.editor.setTheme('pink-dark');

    // Ctrl+S / Cmd+S save action
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        if (onSave) onSave();
      }
    );

    // Prevent duplicate content-change listeners
    if (contentListenerRef.current) {
      contentListenerRef.current.dispose();
    }

    contentListenerRef.current = editor.onDidChangeModelContent(() => {
      if (onContentChange && file) {
        onContentChange(file._id, editor.getValue());
      }
    });

    setupCollaboration(editor);
  };

  const setupCollaboration = (editor) => {
    if (!file || !projectId || !user) return;

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    if (collabRef.current) {
      collabRef.current.destroy();
      collabRef.current = null;
    }

    const roomName = `project_${projectId}_${file._id}`;
    const collab = new CollaborationService(roomName, user);

    collabRef.current = collab;

    collab.onStatusChange(({ status }) => {
      onConnectionStatusChange?.(status);
    });

    collab.onAwarenessChange(() => {
      onOnlineUsersChange?.(collab.getOnlineUsers());
    });

    const model = editor.getModel();

    if (model) {
      try {
        const binding = new MonacoBinding(
          collab.yText,
          model,
          new Set([editor]),
          collab.provider.awareness
        );

        bindingRef.current = binding;
      } catch (err) {
        console.error(
          '[MonacoEditor] Error initializing MonacoBinding:',
          err
        );
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && file) {
      setupCollaboration(editorRef.current);
    }

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (collabRef.current) {
        collabRef.current.destroy();
        collabRef.current = null;
      }
    };
  }, [file?._id, projectId]);

  useEffect(() => {
    return () => {
      if (contentListenerRef.current) {
        contentListenerRef.current.dispose();
        contentListenerRef.current = null;
      }
    };
  }, []);

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#1f1018] text-pink-200/50 select-none">
        <div className="w-16 h-16 rounded-2xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center mb-4">
          <span className="text-3xl text-pink-400">{'</>'}</span>
        </div>

        <p className="text-sm font-medium text-pink-100">
          No file selected
        </p>

        <p className="text-xs mt-2 text-pink-200/50 text-center px-4">
          Select a file from the explorer to start collaborating.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full relative overflow-hidden bg-[#1f1018]">
      <Editor
        height="100%"
        language={language}
        theme="pink-dark"
        path={file._id}
        value={file.content || ''}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          minimap: {
            enabled: true,
            renderCharacters: false
          },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: false,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          padding: {
            top: 12,
            bottom: 12
          },
          roundedSelection: true,
          bracketPairColorization: {
            enabled: true
          },
          guides: {
            indentation: true,
            bracketPairs: true
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true
        }}
      />
    </div>
  );
};

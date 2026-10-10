
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar/Navbar';
import { FileExplorer } from '../../components/FileExplorer/FileExplorer';
import { EditorTabs } from '../../components/Editor/EditorTabs';
import { MonacoEditor } from '../../components/Editor/MonacoEditor';
import { TerminalPanel } from '../../components/Terminal/TerminalPanel';
import { Toast } from '../../components/Common/Toast';
import {
  getLanguageFromFilename,
  getExecutableLanguage
} from '../../utils/languageDetection';

export const Workspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [dirtyFiles, setDirtyFiles] = useState({});
  const [loading, setLoading] = useState(true);

  // Collaboration State
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [saveStatus, setSaveStatus] = useState('Saved');

  // Execution State
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [runningLang, setRunningLang] = useState('JavaScript');
  const [output, setOutput] = useState(null);
  const [toast, setToast] = useState(null);

  const fileContentsRef = useRef({});

  // Toast Notifications
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Project & Files
  const fetchProjectData = async () => {
    try {
      const res = await api.projects.getById(projectId);

      setProject(res.project);
      setFiles(res.files || []);

      if (res.files && res.files.length > 0) {
        const firstFile =
          res.files.find(f => f.type === 'file') || res.files[0];

        if (firstFile) {
          handleOpenFile(firstFile);
          fileContentsRef.current[firstFile._id] = firstFile.content || '';
        }
      }
    } catch (err) {
      if (err.status === 403) {
        showToast('You are not authorized to view this project', 'error');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        showToast(err.message || 'Failed to load project', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Open / Select File
  const handleOpenFile = (file) => {
    if (file.type === 'folder') return;

    setOpenFiles(prev =>
      prev.some(f => f._id === file._id) ? prev : [...prev, file]
    );

    setActiveFile(file);

    const monacoLang = getLanguageFromFilename(file.name);
    const execLang = getExecutableLanguage(monacoLang);

    if (execLang) {
      setSelectedLanguage(execLang);
    }
  };

  // Close Tab
  const handleCloseTab = (fileToClose) => {
    const nextOpen = openFiles.filter(
      f => f._id !== fileToClose._id
    );

    setOpenFiles(nextOpen);

    if (activeFile?._id === fileToClose._id) {
      setActiveFile(
        nextOpen.length > 0 ? nextOpen[nextOpen.length - 1] : null
      );
    }
  };

  // Content Change
  const handleContentChange = (fileId, newContent) => {
    fileContentsRef.current[fileId] = newContent;
    setDirtyFiles(prev => ({ ...prev, [fileId]: true }));
    setSaveStatus('Unsaved changes');
  };

  // Save File
  const handleSave = async () => {
    if (!activeFile) return;

    const currentContent =
      fileContentsRef.current[activeFile._id] ?? activeFile.content;

    try {
      setSaveStatus('Saving...');

      await api.files.update(activeFile._id, {
        content: currentContent
      });

      setDirtyFiles(prev => ({
        ...prev,
        [activeFile._id]: false
      }));

      setSaveStatus('All changes saved');
      showToast('File saved successfully', 'success');

      setTimeout(() => setSaveStatus('Saved'), 2000);
    } catch (err) {
      setSaveStatus('Save failed');
      showToast(err.message || 'Failed to save file', 'error');
    }
  };

  // Create File or Folder
  const handleCreateItem = async ({ name, path, type }) => {
    try {
      const res = await api.files.create(projectId, {
        name,
        path,
        type
      });

      if (res.success && res.file) {
        setFiles(prev => [...prev, res.file]);

        if (res.file.type === 'file') {
          handleOpenFile(res.file);
          fileContentsRef.current[res.file._id] =
            res.file.content || '';
        }

        showToast(
          `${type === 'folder' ? 'Folder' : 'File'} created successfully`,
          'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to create item', 'error');
    }
  };

  // Delete File or Folder
  const handleDeleteItem = async (fileId) => {
    try {
      await api.files.delete(fileId);

      setFiles(prev => prev.filter(f => f._id !== fileId));
      setOpenFiles(prev => prev.filter(f => f._id !== fileId));

      if (activeFile?._id === fileId) {
        setActiveFile(null);
      }

      delete fileContentsRef.current[fileId];

      setDirtyFiles(prev => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });

      showToast('Item deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  // Rename File
  const handleRenameItem = async (item, newName) => {
    try {
      const res = await api.files.update(item._id, {
        name: newName
      });

      if (res.success && res.file) {
        setFiles(prev =>
          prev.map(f => f._id === item._id ? res.file : f)
        );

        setOpenFiles(prev =>
          prev.map(f => f._id === item._id ? res.file : f)
        );

        if (activeFile?._id === item._id) {
          setActiveFile(res.file);
        }

        showToast('Item renamed', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to rename item', 'error');
    }
  };

  // Add Collaborator
  const handleAddCollaborator = async (collaboratorEmail) => {
    try {
      const res = await api.projects.update(projectId, {
        collaboratorEmail
      });

      if (res.success && res.project) {
        setProject(res.project);
        showToast(`Invited ${collaboratorEmail} to project!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to invite collaborator', 'error');
    }
  };

  // Run Code in Docker Sandbox
  const handleRun = async () => {
    if (!activeFile) {
      showToast('No active file to run', 'error');
      return;
    }

    const codeToRun =
      fileContentsRef.current[activeFile._id] ?? activeFile.content;

    const langNames = {
      javascript: 'JavaScript',
      python: 'Python',
      cpp: 'C++'
    };

    setRunningLang(langNames[selectedLanguage] || selectedLanguage);
    setIsRunning(true);
    setOutput(null);

    try {
      const res = await api.execution.run(
        selectedLanguage,
        codeToRun
      );

      setOutput(res);
    } catch (err) {
      setOutput({
        success: false,
        stdout: '',
        stderr:
          err.data?.stderr || err.message || 'Execution failed',
        executionTime: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Pink Loading Screen
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1f1018] text-pink-200/70">
        <div className="w-10 h-10 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mb-4 shadow-lg shadow-pink-950/30" />

        <p className="text-sm font-medium text-pink-200">
          Loading workspace...
        </p>

        <p className="text-xs text-pink-200/40 mt-1">
          Preparing your coding environment
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1f1018] text-pink-100/90 overflow-hidden">
      {/* Navbar */}
      <Navbar
        project={project}
        onSave={handleSave}
        onRun={handleRun}
        isRunning={isRunning}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        isDirty={activeFile ? dirtyFiles[activeFile._id] : false}
        saveStatus={saveStatus}
        connectionStatus={connectionStatus}
        onlineUsers={onlineUsers}
        onAddCollaborator={handleAddCollaborator}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden bg-[#1f1018]">
        {/* File Explorer */}
        <FileExplorer
          files={files}
          activeFile={activeFile}
          onSelectFile={handleOpenFile}
          onCreateItem={handleCreateItem}
          onDeleteItem={handleDeleteItem}
          onRenameItem={handleRenameItem}
          onRefresh={fetchProjectData}
        />

        {/* Editor and Tabs */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#1f1018]">
          <EditorTabs
            openFiles={openFiles}
            activeFile={activeFile}
            dirtyFiles={dirtyFiles}
            onSelectTab={setActiveFile}
            onCloseTab={handleCloseTab}
          />

          <div className="flex-1 min-h-0 overflow-hidden border-t border-pink-900/30">
            <MonacoEditor
              projectId={projectId}
              file={activeFile}
              user={user}
              onContentChange={handleContentChange}
              onSave={handleSave}
              onConnectionStatusChange={setConnectionStatus}
              onOnlineUsersChange={setOnlineUsers}
            />
          </div>
        </div>
      </div>

      {/* Terminal and Output */}
      <TerminalPanel
        output={output}
        isRunning={isRunning}
        runningLang={runningLang}
        executionTime={output?.executionTime}
        onClear={() => setOutput(null)}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};


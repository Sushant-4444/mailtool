import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Undo, Redo, 
  Braces, Code2, Eye, Monitor 
} from 'lucide-react';

// --- 1. The Toolbar Component ---
const MenuBar = ({ editor, variables }) => {
  if (!editor) {
    return null;
  }

  const insertVariable = (varName) => {
    // Insert variable with double curly braces
    editor.chain().focus().insertContent(` {{${varName}}} `).run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-2 bg-gray-50 rounded-t-lg">
      
      {/* Basic Formatting */}
      <div className="flex bg-white border border-gray-200 rounded-md overflow-hidden">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex bg-white border border-gray-200 rounded-md overflow-hidden ml-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
        >
          <ListOrdered size={18} />
        </button>
      </div>

      {/* Variable Inserter */}
      <div className="ml-auto relative group">
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 border border-blue-200 text-sm font-medium">
          <Braces size={16} />
          <span>Insert Variable</span>
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-md border border-gray-100 hidden group-hover:block z-10">
          <div className="py-1">
            {variables.map((v) => (
              <button
                key={v}
                onClick={() => insertVariable(v)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="flex ml-2 text-gray-400">
        <button onClick={() => editor.chain().focus().undo().run()} className="p-2 hover:text-gray-600">
          <Undo size={18} />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className="p-2 hover:text-gray-600">
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
};


// --- 2. The Main Editor Component ---
const EmailEditor = ({ initialContent, onUpdate, onNext, onBack, availableVariables = [] }) => {
  
  const AVAILABLE_VARIABLES = availableVariables.length > 0 
    ? availableVariables 
    : ['firstName', 'lastName', 'email', 'company']; // fallback for backward compatibility
    
  const [editorMode, setEditorMode] = useState('visual'); // 'visual', 'html', or 'preview'
  const [htmlCode, setHtmlCode] = useState(initialContent || '');
  const [lastEditMode, setLastEditMode] = useState('visual'); // Track which mode was last edited

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Start typing your email here...',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlCode(html);
      onUpdate(html);
      setLastEditMode('visual');
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
        },
    },
  });

  const switchToHtmlMode = () => {
    // Only sync from TipTap if we were in visual mode
    if (editorMode === 'visual' && editor) {
      setHtmlCode(editor.getHTML());
    }
    setEditorMode('html');
  };

  const switchToVisualMode = () => {
    // Warn if switching from HTML mode with custom code
    if (editorMode === 'html' && lastEditMode === 'html') {
      const confirmed = window.confirm(
        '⚠️ Warning: Switching to Visual mode may remove custom CSS and complex HTML formatting. Continue?'
      );
      if (!confirmed) return;
    }
    
    // Load HTML into TipTap
    if (editor) {
      editor.commands.setContent(htmlCode);
    }
    setEditorMode('visual');
  };

  const switchToPreview = () => {
    // Sync from current mode before preview
    if (editorMode === 'visual' && editor) {
      setHtmlCode(editor.getHTML());
    }
    setEditorMode('preview');
  };

  const handleHtmlChange = (e) => {
    const newHtml = e.target.value;
    setHtmlCode(newHtml);
    onUpdate(newHtml);
    setLastEditMode('html');
  };

  const insertVariableIntoHtml = (varName) => {
    const textarea = document.getElementById('html-editor-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = htmlCode;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + `{{${varName}}}` + after;
    
    setHtmlCode(newText);
    onUpdate(newText);
    setLastEditMode('html');
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + varName.length + 4, start + varName.length + 4);
    }, 0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Design Your Email</h2>
            <p className="text-sm text-gray-500">
                Use variables like <code className="bg-gray-100 px-1 rounded text-xs">{ '{{firstName}}' }</code> to personalize.
            </p>
        </div>
        
        {/* Mode Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={switchToVisualMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              editorMode === 'visual' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Eye size={16} />
            Visual
            {lastEditMode === 'html' && editorMode !== 'visual' && <span className="text-xs text-orange-500">⚠️</span>}
          </button>
          <button
            onClick={switchToHtmlMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              editorMode === 'html' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Code2 size={16} />
            HTML/CSS
          </button>
          <button
            onClick={switchToPreview}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              editorMode === 'preview' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Monitor size={16} />
            Preview
          </button>
        </div>
      </div>

      {/* Editor Container */}
      {editorMode === 'visual' ? (
        <div className="flex-grow border rounded-lg shadow-sm bg-white flex flex-col overflow-hidden">
          <MenuBar editor={editor} variables={AVAILABLE_VARIABLES} />
          <div className="flex-grow overflow-y-auto bg-white cursor-text" onClick={() => editor?.chain().focus().run()}>
              <EditorContent editor={editor} />
          </div>
        </div>
      ) : editorMode === 'html' ? (
        <div className="flex-grow border rounded-lg shadow-sm bg-white flex flex-col overflow-hidden">
          <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg flex items-center justify-between">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <Code2 size={14} />
              Write your custom HTML/CSS code below. You can use inline styles or {'<style>'} tags.
            </p>
            
            {/* Variable Inserter for HTML Mode */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 border border-blue-200 text-xs font-medium">
                <Braces size={14} />
                <span>Insert Variable</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-md border border-gray-100 hidden group-hover:block z-10">
                <div className="py-1">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v}
                      onClick={() => insertVariableIntoHtml(v)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {'{{' + v + '}}'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <textarea
            id="html-editor-textarea"
            value={htmlCode}
            onChange={handleHtmlChange}
            className="flex-grow p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset min-h-[500px]"
            placeholder="<div style='font-family: Arial, sans-serif;'>
  <h1>Hello {{firstName}}</h1>
  <p>Welcome to our newsletter!</p>
</div>"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="flex-grow border rounded-lg shadow-sm bg-white flex flex-col overflow-hidden">
          <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <Monitor size={14} />
              Preview - This is how your email will look with all HTML/CSS styling applied
            </p>
          </div>
          <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <div 
                dangerouslySetInnerHTML={{ __html: htmlCode }} 
                className="email-preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="mt-6 flex justify-between pt-4 border-t">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 px-4 py-2">
          Back
        </button>
        <button 
          onClick={onNext}
          className="px-6 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 shadow-md"
        >
          Next: Attachments
        </button>
      </div>
    </div>
  );
};

export default EmailEditor;

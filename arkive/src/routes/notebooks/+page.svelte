<script>
// @ts-nocheck

  import { onMount } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
  import mammoth from 'mammoth';
  import { Document, Packer, Paragraph, TextRun } from 'docx';

  // Initialize PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  // Persistent storage keys
  const NOTES_KEY = 'arkive-notes';
  const CATEGORIES_KEY = 'arkive-categories';

  // State management
  let categories = ['General', 'School', 'Work', 'Personal'];
  let currentCategory = 'General';
  let notes = {};
  let currentNote = null;
  let isLoading = false;
  let searchQuery = '';
  let newCategoryName = '';
  let showCategoryModal = false;

  // Load data from localStorage
  onMount(() => {
    const savedNotes = localStorage.getItem(NOTES_KEY);
    const savedCategories = localStorage.getItem(CATEGORIES_KEY);
    
    if (savedNotes) notes = JSON.parse(savedNotes);
    if (savedCategories) categories = JSON.parse(savedCategories);
    
    // Initialize current category if it exists
    if (categories.length > 0 && !currentCategory) {
      currentCategory = categories[0];
    }
    
    // Initialize categories in notes if they don't exist
    categories.forEach(category => {
      if (!notes[category]) notes[category] = [];
    });
  });

  // Save data to localStorage
  function persistData() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }

  // Generate unique ID for notes
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Category management
  function addCategory() {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      categories = [...categories, trimmedName]; // Create new array to trigger reactivity
      notes[trimmedName] = [];
      currentCategory = trimmedName;
      newCategoryName = '';
      showCategoryModal = false;
      persistData();
    }
  }

  function deleteCategory(category) {
    if (confirm(`Delete category '${category}' and all its notes?`)) {
      // Create new arrays/objects to trigger reactivity
      categories = categories.filter(c => c !== category);
      const newNotes = {...notes};
      delete newNotes[category];
      notes = newNotes;
      
      if (currentCategory === category) {
        currentCategory = categories[0] || '';
      }
      persistData();
    }
  }

  // Note management
  function createNewNote() {
    const newNote = {
      id: generateId(),
      title: `New Note ${notes[currentCategory].length + 1}`,
      content: "",
      createdAt: new Date()
    };
    notes[currentCategory] = [newNote, ...notes[currentCategory]];
    currentNote = newNote;
    persistData();
  }

  function deleteCurrentNote() {
    if (currentNote && confirm(`Delete note '${currentNote.title}'?`)) {
      notes[currentCategory] = notes[currentCategory].filter(n => n.id !== currentNote.id);
      currentNote = notes[currentCategory][0] || null;
      persistData();
    }
  }

  function updateCurrentNote() {
    if (currentNote) {
      notes[currentCategory] = notes[currentCategory].map(n => 
        n.id === currentNote.id ? {...currentNote, updatedAt: new Date()} : n
      );
      persistData();
    }
  }

  // File handling
  async function handleFileUpload(event) {
    const uploadedFiles = Array.from(event.target.files);
    if (!uploadedFiles.length) return;

    isLoading = true;
    
    try {
      for (let file of uploadedFiles) {
        const content = await extractFileContent(file);
        const newNote = {
          id: generateId(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          content,
          createdAt: new Date(),
          sourceFile: file.name
        };
        
        if (!notes[currentCategory]) notes[currentCategory] = [];
        notes[currentCategory] = [newNote, ...notes[currentCategory]];
        currentNote = newNote;
      }
      persistData();
    } catch (error) {
      alert(`Error processing files: ${error.message}`);
    } finally {
      isLoading = false;
    }
  }

  // Category management
  let draggedCategory = null;
  let dragOverCategory = null;

  function handleDragStart(category) {
    draggedCategory = category;
  }

  function handleDragOver(e, category) {
    e.preventDefault();
    if (category !== draggedCategory) {
      dragOverCategory = category;
    }
  }

  function handleDrop() {
    if (draggedCategory && dragOverCategory && draggedCategory !== dragOverCategory) {
      const draggedIndex = categories.indexOf(draggedCategory);
      const dropIndex = categories.indexOf(dragOverCategory);
      
      // Create a new array to trigger reactivity
      categories = [
        ...categories.slice(0, draggedIndex),
        ...categories.slice(draggedIndex + 1)
      ];
      
      categories = [
        ...categories.slice(0, dropIndex),
        draggedCategory,
        ...categories.slice(dropIndex)
      ];
      
      persistData();
    }
    draggedCategory = null;
    dragOverCategory = null;
  }

  function handleDragEnd() {
    draggedCategory = null;
    dragOverCategory = null;
  }

  async function extractFileContent(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return await extractPDFContent(file);
    } else if (fileName.endsWith('.docx')) {
      return await extractDOCXContent(file);
    } else {
      return await extractTextContent(file);
    }
  }

  async function extractPDFContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          
          let textContent = '';
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const text = await page.getTextContent();
            textContent += text.items.map(item => item.str).join(' ') + '\n';
          }
          resolve(textContent);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  async function extractDOCXContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const arrayBuffer = reader.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read DOCX file'));
      reader.readAsArrayBuffer(file);
    });
  }

  function extractTextContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  // Export function
  function downloadCurrentNote() {
    if (!currentNote) {
      alert('Please select a note to download.');
      return;
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: currentNote.title, bold: true, size: 28 })],
          }),
          new Paragraph({
            children: [new TextRun("")],
          }),
          ...currentNote.content
            .split('\n')
            .filter(line => line.trim())
            .map(line => new Paragraph({
              children: [new TextRun({ text: line, break: 1 })]
            }))
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentNote.title}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Filter notes based on search query
  $: filteredNotes = notes[currentCategory]?.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
</script>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  :root {
    --bg-color: hsla(30.73, 22.65%, 64.51%, 1);
    --text-color: #1e1e1e;
    --primary-color: #4a4a4a;
    --secondary-color: #d4bfae;
    --card-bg: #fafafa;
    --editor-bg: #ffffff;
    --border-color: #ccc;
    --hover-color: #e0e0e0;
    --accent-color: #5c6bc0;
  }

  /* Drag and drop specific styles */
  .category-tab {
    user-select: none;
    cursor: grab;
    transition: transform 0.2s, opacity 0.2s;
    position: relative;
  }

  .category-tab:active {
    cursor: grabbing;
  }

  .category-tab.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }

  .category-tab.drop-target::after {
    content: '';
    position: absolute;
    top: 0;
    left: -5px;
    height: 100%;
    border-left: 2px solid var(--accent-color);
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  :root {
    --bg-color: hsla(30.73, 22.65%, 64.51%, 1);
    --text-color: #1e1e1e;
    --primary-color: #4a4a4a;
    --secondary-color: #d4bfae;
    --card-bg: #fafafa;
    --editor-bg: #ffffff;
    --border-color: #ccc;
    --hover-color: #e0e0e0;
    --accent-color: #5c6bc0;
  }

  nav {
    background-color: var(--bg-color);
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text-color);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .nav-links a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.2s;
    padding: 0.5rem 0;
    border-bottom: 2px solid transparent;
  }

  .nav-links a:hover {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
  }

  .nav-links a.active {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
  }

  .page-wrapper {
    padding: 2rem 3rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  .subtext {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 50rem;
    line-height: 1.5;
    color: var(--text-color);
    opacity: 0.9;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .category-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .category-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .category-tab {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .category-tab:hover {
    background-color: var(--hover-color);
  }

  .category-tab.active {
    background-color: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .category-tab .delete {
    margin-left: 0.5rem;
    color: #999;
    font-size: 0.8rem;
  }

  .category-tab .delete:hover {
    color: #ff4444;
  }

  .category-tab {
    /* ... existing styles ... */
    user-select: none;
    cursor: grab;
    transition: transform 0.2s;
  }

  .category-tab.dragging {
    opacity: 0.5;
  }

  .category-tab.drop-target {
    border: 2px dashed var(--accent-color);
  }

  .search-box {
    flex-grow: 1;
    max-width: 300px;
    padding: 0.6rem 1rem;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
  }

  .main-content {
    display: flex;
    gap: 2rem;
    height: calc(100vh - 200px);
  }

  .sidebar {
    flex: 0 0 300px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .note-card-button {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .note-card-button:hover {
    background-color: var(--hover-color);
    transform: translateX(3px);
  }

  .note-card-button.active {
    border-left: 4px solid var(--accent-color);
    background-color: var(--hover-color);
  }

  .note-card-button .title {
    font-weight: 600;
    margin-bottom: 0.3rem;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .note-card-button .date {
    font-size: 0.8rem;
    color: #666;
  }

  .note-card-button .preview {
    font-size: 0.9rem;
    color: #555;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .editor {
    flex: 1;
    background-color: var(--editor-bg);
    border-radius: 8px;
    padding: 2rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .editor-header {
    margin-bottom: 1.5rem;
  }

  .editor-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .editor-meta {
    font-size: 0.9rem;
    color: #666;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  textarea, input[type="text"] {
    width: 100%;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    margin-bottom: 1rem;
    font-family: inherit;
    font-size: 1rem;
    resize: none;
    flex-grow: 1;
  }

  textarea {
    min-height: 300px;
    line-height: 1.6;
  }

  input[type="text"] {
    font-size: 1.2rem;
    font-weight: 500;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  button {
    padding: 0.7rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  button.secondary {
    background: #6c757d;
  }

  button.danger {
    background: #dc3545;
  }

  button.accent {
    background: var(--accent-color);
  }

  .upload-box {
    border: 2px dashed var(--border-color);
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
    margin: 1rem 0;
    background: var(--card-bg);
    transition: all 0.2s;
    cursor: pointer;
  }

  .upload-box:hover {
    border-color: var(--accent-color);
    background: var(--hover-color);
  }

  .upload-box input {
    display: none;
  }

  .upload-box label {
    cursor: pointer;
    display: block;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .modal-input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-top: 1rem;
  }

  .loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-left: 10px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  @media (max-width: 768px) {
    .main-content {
      flex-direction: column;
      height: auto;
    }

    .sidebar {
      flex: 1;
      max-height: 300px;
    }

    nav {
      padding: 1rem;
    }

    .page-wrapper {
      padding: 1.5rem;
    }

    .category-selector {
      max-width: 100%;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
  }
</style>

<!-- Nav bar -->
<nav>
  <a href="/" class="logo">ARKIVE</a>
  <div class="nav-links">
    <!-- <a href="/">Home</a> -->
    <a href="/calendar">Calendar</a>
    <a href="/agent">Agent</a>
    <a href="/notebooks"class="active">Notebooks</a>
    <!-- <button class="login-btn">Login</button> -->
  </div>
</nav>

<!-- Notebook Page Layout -->
<div class="page-wrapper">
  <h1>My Notebook</h1>
  <p class="subtext">
    Organize your notes with custom categories for easy access and management.
  </p>

  <div class="controls">
    <div class="category-controls">
      <div class="category-selector">
        {#each categories as category}
          <div 
            class="category-tab 
              {currentCategory === category ? 'active' : ''}
              {draggedCategory === category ? 'dragging' : ''}
              {dragOverCategory === category ? 'drop-target' : ''}"
            on:click={() => currentCategory = category}
            draggable="true"
            on:dragstart={() => handleDragStart(category)}
            on:dragover={(e) => handleDragOver(e, category)}
            on:drop={handleDrop}
            on:dragend={handleDragEnd}
          >
            {category}
            <span class="delete" on:click|stopPropagation={() => deleteCategory(category)}>×</span>
          </div>
        {/each}
      </div>
      <button class="accent" on:click={() => showCategoryModal = true}>+ New Category</button>
    </div>

    <input 
      class="search-box" 
      type="text" 
      placeholder="Search notes..." 
      bind:value={searchQuery}
    />
  </div>

  <div class="main-content">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="upload-box">
        <input 
          id="file-upload"
          type="file" 
          multiple 
          accept=".pdf,.txt,.md,.docx" 
          on:change={handleFileUpload}
        />
        <label for="file-upload">
          {#if isLoading}
            <span>Processing... <span class="loading"></span></span>
          {:else}
            <span>📁 Upload PDF, DOCX, or text files</span>
          {/if}
        </label>
      </div>

      <button on:click={createNewNote}>+ Create New Note</button>

      {#if filteredNotes.length === 0}
        <div class="empty-state">
          {#if searchQuery}
            <p>No notes match your search</p>
          {:else}
            <p>No notes found in this category</p>
          {/if}
        </div>
      {:else}
        {#each filteredNotes as note}
          <div 
            class="note-card-button {currentNote?.id === note.id ? 'active' : ''}" 
            on:click={() => currentNote = note}
          >
            <div class="title">{note.title}</div>
            <div class="date">{new Date(note.createdAt).toLocaleDateString()}</div>
            {#if note.content}
              <div class="preview">
                {note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Editor Area -->
    <div class="editor">
      {#if currentNote}
        <div class="editor-header">
          <input 
            type="text" 
            bind:value={currentNote.title} 
            placeholder="Note Title" 
            on:input={updateCurrentNote}
          />
          <div class="editor-meta">
            <span>Created: {new Date(currentNote.createdAt).toLocaleString()}</span>
            {#if currentNote.updatedAt}
              <span>Updated: {new Date(currentNote.updatedAt).toLocaleString()}</span>
            {/if}
            {#if currentNote.sourceFile}
              <span>Source: {currentNote.sourceFile}</span>
            {/if}
          </div>
        </div>
        
        <textarea 
          bind:value={currentNote.content} 
          placeholder="Write your note here..." 
          on:input={updateCurrentNote}
        ></textarea>
        
        <div class="buttons">
          <button class="danger" on:click={deleteCurrentNote}>Delete Note</button>
          <button on:click={downloadCurrentNote}>Download as DOCX</button>
        </div>
      {:else}
        <div class="empty-state">
          <p>{filteredNotes.length === 0 ? 'Create or upload your first note to get started' : 'Select a note to begin editing'}</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Category Modal -->
{#if showCategoryModal}
  <div class="modal" on:click|self={() => showCategoryModal = false}>
    <div class="modal-content">
      <h2>Create New Category</h2>
      <input 
        class="modal-input" 
        type="text" 
        bind:value={newCategoryName}
        placeholder="Enter category name"
        on:keydown={(e) => e.key === 'Enter' && addCategory()}
      />
      <div class="modal-actions">
        <button class="secondary" on:click={() => showCategoryModal = false}>Cancel</button>
        <button on:click={addCategory}>Create</button>
      </div>
    </div>
  </div>
{/if}

{#if showCategoryModal}
    <div class="modal" on:click|self={() => showCategoryModal = false}>
      <div class="modal-content">
        <h2>Create New Category</h2>
        <input 
          class="modal-input" 
          type="text" 
          bind:value={newCategoryName}
          placeholder="Enter category name"
          on:keydown={(e) => e.key === 'Enter' && addCategory()}
        />
        <div class="modal-actions">
          <button class="secondary" on:click={() => showCategoryModal = false}>Cancel</button>
          <button on:click={addCategory}>Create</button>
        </div>
      </div>
    </div>
  {/if}

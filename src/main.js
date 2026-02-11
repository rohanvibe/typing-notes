import './style.css';

console.log('Typing Notes Platform v2.0 Initializing...');

import { kernel } from './core/kernel.js';
import { bus } from './core/event-bus.js';
import { Layout } from './ui/layout.js';
import EditorModule from './modules/editor/index.js';
import FileSystemModule from './modules/filesystem/index.js';

const app = document.querySelector('#app');

// UI Bootstrapper
bus.on('app:ready', () => {
  app.innerHTML = Layout.render();

  // Initialize UI components
  Layout.init();

  // Mount Modules to UI
  EditorModule.mount('editor-container');
  FileSystemModule.mount('file-tree');
});

// Start the Engine
kernel.init();

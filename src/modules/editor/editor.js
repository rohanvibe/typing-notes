import { bus } from '../../core/event-bus.js';
import { marked } from 'marked';

export class EditorModule {
    constructor() {
        this.name = 'editor';
        this.container = null;
        this.currentNote = null;
    }

    init() {
        console.log('Editor Module Initialized');
        bus.on('file:open', (file) => this.openFile(file));
        bus.on('note:create', (file) => this.openFile(file));
    }

    mount(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="editor-wrapper">
                <input type="text" id="note-title" class="note-title" placeholder="Untitled Note" />
                <div class="toolbar">
                    <button class="btn-preview">👁️ Preview</button>
                    <button class="btn-save">💾 Save</button>
                </div>
                <div class="editor-split">
                    <textarea id="editor-raw" class="editor-content" placeholder="Type markdown here..."></textarea>
                    <div id="editor-preview" class="editor-content" style="display:none;"></div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const titleInput = this.container.querySelector('#note-title');
        const rawEditor = this.container.querySelector('#editor-raw');
        const previewBtn = this.container.querySelector('.btn-preview');
        const saveBtn = this.container.querySelector('.btn-save');

        // Auto-save on input
        rawEditor.addEventListener('input', () => {
            if (this.currentNote) {
                this.currentNote.content = rawEditor.value;
                // Debounce save in real app
                // bus.emit('note:save', this.currentNote); 
            }
        });

        titleInput.addEventListener('input', () => {
            if (this.currentNote) {
                this.currentNote.title = titleInput.value;
            }
        });

        // Toggle Preview
        previewBtn.addEventListener('click', () => {
            const preview = this.container.querySelector('#editor-preview');
            const isPreview = preview.style.display !== 'none';

            if (isPreview) {
                preview.style.display = 'none';
                rawEditor.style.display = 'block';
            } else {
                preview.innerHTML = marked.parse(rawEditor.value);
                preview.style.display = 'block';
                rawEditor.style.display = 'none';
            }
        });

        saveBtn.addEventListener('click', () => {
            if (this.currentNote) {
                bus.emit('note:save', this.currentNote);
            }
        });
    }

    openFile(file) {
        if (!this.container) return;
        this.currentNote = file;

        const titleInput = this.container.querySelector('#note-title');
        const rawEditor = this.container.querySelector('#editor-raw');
        const preview = this.container.querySelector('#editor-preview');

        titleInput.value = file.title;
        rawEditor.value = file.content;

        // Reset to edit mode
        preview.style.display = 'none';
        rawEditor.style.display = 'block';

        console.log('Editor opened note:', file.id);
    }
}

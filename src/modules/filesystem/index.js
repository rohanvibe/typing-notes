import { bus } from '../../core/event-bus.js';
import { db, STORES } from '../../data/db.js';
import { Schema } from '../../data/schema.js';

export class FileSystemModule {
    constructor() {
        this.name = 'filesystem';
    }

    init() {
        console.log('FileSystem Module Initialized');
        // Listen for creation events
        bus.on('note:create', (data) => this.createNote(data));
        bus.on('note:save', (data) => this.saveNote(data));
        bus.on('folder:create', (data) => this.createFolder(data));

        // Load initial data
        this.loadNotes();
    }

    async createNote({ title, content }) {
        const note = Schema.createNote(title, content);
        await db.set(STORES.NOTES, note);
        console.log('Note Created:', note);
        // Refresh list
        await this.loadNotes();
        // Open the new note
        bus.emit('file:open', note);
    }

    async saveNote(note) {
        note.updated_at = new Date().toISOString();
        await db.set(STORES.NOTES, note);
        console.log('Note Saved:', note);
        await this.loadNotes();
    }

    async loadNotes() {
        const notes = await db.getAll(STORES.NOTES);
        this.notes = notes || [];
        this.render();
    }

    mount(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        if (!this.container) return;

        if (this.notes.length === 0) {
            this.container.innerHTML = '<div class="empty-list">No notes yet</div>';
            return;
        }

        this.container.innerHTML = `
            <ul class="note-list">
                ${this.notes.map(note => `
                    <li class="note-item" data-id="${note.id}">
                        <div class="note-title">${note.title}</div>
                        <div class="note-meta">${new Date(note.updated_at).toLocaleDateString()}</div>
                    </li>
                `).join('')}
            </ul>
        `;

        // Bind clicks
        this.container.querySelectorAll('.note-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const note = this.notes.find(n => n.id === id);
                if (note) bus.emit('file:open', note);
            });
        });
    }
}

export default new FileSystemModule();


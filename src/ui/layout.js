export const Layout = {
    render() {
        return `
            <div class="layout">
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <h2>Notes</h2>
                        <button id="btn-new-note" class="icon-btn">+</button>
                    </div>
                    <nav id="file-tree" class="file-tree">
                        <!-- File Tree Injected Here -->
                        <div class="loading-placeholder">Loading...</div>
                    </nav>
                    <div class="sidebar-footer">
                        <button id="btn-settings" class="icon-btn">⚙️</button>
                    </div>
                </aside>
                <main class="main-content">
                    <div id="editor-container" class="editor-container">
                        <!-- Editor Injected Here -->
                        <div class="empty-state">Select a note to view</div>
                    </div>
                </main>
            </div>
        `;
    },

    init() {
        const newNoteBtn = document.getElementById('btn-new-note');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => {
                // Determine active folder (TODO)
                // Emit create event
                import('../core/event-bus.js').then(({ bus }) => {
                    bus.emit('note:create', { title: 'New Note', content: '' });
                });
            });
        }
    }
};

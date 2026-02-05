/**
 * Typing Notes - Core Application Logic
 * v1.4.0 - Visual Practice & Precise Feedback
 */

const App = {
    // State management
    state: {
        currentNote: '',
        startTime: null,
        typingStarted: false,
        lastWpmUpdate: 0,
        wpmInterval: 2000,
        sessions: [],

        // Central Settings
        settings: {
            historyEnabled: true,
            autoPractice: true,
            autoSave: true,
            clearSession: false,
            showWpm: true,
            showAccuracy: true,
            autofocus: true,
            disablePaste: true,
            theme: 'system',
            fontSize: 'medium',
            animations: true,
            shortcutsEnabled: false
        }
    },

    // DOM Elements
    elements: {
        screens: document.querySelectorAll('.screen'),
        homeBtn: document.getElementById('new-note-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        closeSettingsBtn: document.getElementById('close-settings-btn'),
        endSessionBtn: document.getElementById('end-session-btn'),
        practiceBtn: document.getElementById('practice-btn'),
        backHomeBtn: document.getElementById('back-home-btn'),
        finishPracticeBtn: document.getElementById('finish-practice-btn'),

        noteTextarea: document.getElementById('note-textarea'),
        practiceTextarea: document.getElementById('practice-textarea'),
        referenceText: document.getElementById('reference-text'),

        wpmDisplay: document.getElementById('wpm'),
        accuracyDisplay: document.getElementById('accuracy'),
        statusBadge: document.getElementById('status-badge'),

        welcomeMsg: document.getElementById('welcome-message'),
        historyPreview: document.getElementById('last-session-summary'),
        summaryTitle: document.getElementById('summary-title'),
        summarySubtitle: document.getElementById('summary-subtitle'),
        resultDisplay: document.getElementById('result-display'),
        finalWpm: document.getElementById('final-wpm'),
        finalAccuracy: document.getElementById('final-accuracy'),
        finalWpmContainer: document.getElementById('final-wpm-container'),
        finalAccuracyContainer: document.getElementById('final-accuracy-container'),

        // Stats containers
        wordCount: document.getElementById('word-count'),
        readTime: document.getElementById('read-time'),

        // Settings Inputs
        inputs: {
            historyEnabled: document.getElementById('setting-history'),
            autoPractice: document.getElementById('setting-auto-practice'),
            autoSave: document.getElementById('setting-auto-save'),
            clearSession: document.getElementById('setting-clear-session'),
            showWpm: document.getElementById('setting-show-wpm'),
            showAccuracy: document.getElementById('setting-show-accuracy'),
            autofocus: document.getElementById('setting-autofocus'),
            disablePaste: document.getElementById('setting-disable-paste'),
            theme: document.getElementById('setting-theme'),
            fontSize: document.getElementById('setting-font-size'),
            animations: document.getElementById('setting-animations'),
            shortcutsEnabled: document.getElementById('setting-shortcuts')
        }
    },

    init() {
        console.log('App Initializing...');
        this.loadSettings();
        this.loadSessions();
        this.bindEvents();
        this.applySettings();
        this.showScreen('home-screen');
    },

    bindEvents() {
        // Navigation
        this.elements.homeBtn.addEventListener('click', () => {
            this.elements.noteTextarea.disabled = false;
            this.showScreen('editor-screen');
        });

        this.elements.settingsBtn.addEventListener('click', () => {
            this.showScreen('settings-screen');
        });

        this.elements.closeSettingsBtn.addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        // Auto-save logic
        this.elements.noteTextarea.addEventListener('input', () => {
            if (this.state.settings.autoSave) {
                this.saveNote(true);
            }
        });

        this.elements.endSessionBtn.addEventListener('click', () => {
            this.saveNote();
            this.elements.noteTextarea.disabled = true;

            if (this.state.settings.autoPractice) {
                this.prepareSummary(false);
                this.showScreen('summary-screen');
            } else {
                this.resetSession();
                this.showScreen('home-screen');
            }
        });

        this.elements.practiceBtn.addEventListener('click', () => {
            this.startPractice();
        });

        this.elements.backHomeBtn.addEventListener('click', () => {
            if (this.state.settings.clearSession) {
                this.resetSession();
            }
            this.showScreen('home-screen');
        });

        this.elements.finishPracticeBtn.addEventListener('click', () => {
            document.body.classList.remove('no-scroll');
            if (this.state.settings.historyEnabled) {
                this.saveSession();
            }
            this.prepareSummary(true);
            this.showScreen('summary-screen');
        });

        // Typing Engine
        this.elements.practiceTextarea.addEventListener('input', (e) => {
            this.handleTyping(e);
        });

        this.elements.practiceTextarea.addEventListener('paste', (e) => {
            if (this.state.settings.disablePaste) {
                e.preventDefault();
            }
        });

        // Settings Listeners
        Object.keys(this.elements.inputs).forEach(key => {
            const input = this.elements.inputs[key];
            if (!input) return;
            input.addEventListener('change', () => {
                this.updateSetting(key, input.type === 'checkbox' ? input.checked : input.value);
            });
        });

        // Power User Shortcuts
        window.addEventListener('keydown', (e) => this.handleShortcuts(e));
    },

    // Settings Logic
    loadSettings() {
        const saved = localStorage.getItem('typing_settings_v1');
        if (saved) {
            this.state.settings = { ...this.state.settings, ...JSON.parse(saved) };
        }

        // Sync UI with state
        Object.keys(this.elements.inputs).forEach(key => {
            const input = this.elements.inputs[key];
            if (!input) return;
            if (input.type === 'checkbox') {
                input.checked = this.state.settings[key];
            } else {
                input.value = this.state.settings[key];
            }
        });
    },

    updateSetting(key, value) {
        this.state.settings[key] = value;
        localStorage.setItem('typing_settings_v1', JSON.stringify(this.state.settings));
        this.applySettings();
    },

    applySettings() {
        const s = this.state.settings;

        // Theme
        let themeToApply = s.theme;
        if (themeToApply === 'system') {
            themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.body.setAttribute('data-theme', themeToApply);

        // Font Size
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${s.fontSize}`);

        // Animations
        document.body.classList.toggle('no-animations', !s.animations);

        // UI Toggles
        if (this.elements.wpmDisplay) this.elements.wpmDisplay.parentElement.style.display = s.showWpm ? 'block' : 'none';
        if (this.elements.accuracyDisplay) this.elements.accuracyDisplay.parentElement.style.display = s.showAccuracy ? 'block' : 'none';

        if (this.elements.finalWpmContainer) this.elements.finalWpmContainer.style.display = s.showWpm ? 'flex' : 'none';
        if (this.elements.finalAccuracyContainer) this.elements.finalAccuracyContainer.style.display = s.showAccuracy ? 'flex' : 'none';

        // Handle History Visibility on Home
        if (document.getElementById('home-screen').classList.contains('active')) {
            this.refreshHome();
        }
    },

    handleShortcuts(e) {
        if (!this.state.settings.shortcutsEnabled) return;

        const isModifier = e.ctrlKey || e.metaKey;
        const activeTag = document.activeElement.tagName;

        if (e.key === 'Escape') {
            if (document.getElementById('settings-screen').classList.contains('active')) {
                this.showScreen('home-screen');
            } else if (document.getElementById('editor-screen').classList.contains('active')) {
                this.showScreen('home-screen');
            }
        }

        if (isModifier) {
            if (e.key === 'n') { e.preventDefault(); this.elements.homeBtn.click(); }
            else if (e.key === 'Enter') {
                e.preventDefault();
                if (document.getElementById('editor-screen').classList.contains('active')) this.elements.endSessionBtn.click();
                else if (document.getElementById('practice-screen').classList.contains('active')) this.elements.finishPracticeBtn.click();
            } else if (e.key === 'p' && document.getElementById('summary-screen').classList.contains('active')) {
                e.preventDefault(); this.elements.practiceBtn.click();
            }
        }
    },

    // Screen Management
    showScreen(screenId) {
        this.elements.screens.forEach(screen => screen.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            if (screenId === 'home-screen') this.refreshHome();
            if (this.state.settings.autofocus || screenId === 'editor-screen') {
                setTimeout(() => {
                    if (screenId === 'editor-screen') this.elements.noteTextarea.focus();
                    if (screenId === 'practice-screen' && this.state.settings.autofocus) this.elements.practiceTextarea.focus();
                }, 400);
            }
        }
    },

    // UI Updates
    refreshHome() {
        if (this.state.settings.historyEnabled && this.state.sessions.length > 0) {
            this.elements.welcomeMsg.textContent = "Welcome back. Ready to practice?";
            const last = this.state.sessions[0];
            this.elements.historyPreview.innerHTML = `
                <h3>Last Session</h3>
                <div class="preview-stats">
                    <div class="preview-item">${last.wpm}<small>WPM</small></div>
                    <div class="preview-item">${last.accuracy}%<small>Accuracy</small></div>
                </div>
            `;
            this.elements.historyPreview.style.display = 'block';
        } else {
            this.elements.welcomeMsg.textContent = "Hey there, what's up?";
            this.elements.historyPreview.style.display = 'none';
        }
    },

    prepareSummary(isPostPractice) {
        const text = this.state.currentNote;
        const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        const readTime = Math.ceil(words / 200); // Average reading speed

        this.elements.wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
        this.elements.readTime.textContent = `${readTime} min read`;

        if (isPostPractice) {
            const last = this.state.sessions[0] || { wpm: 0, accuracy: 0 };
            this.elements.summaryTitle.textContent = "Great Work!";
            this.elements.summarySubtitle.textContent = "Your typing results are in:";
            this.elements.resultDisplay.style.display = 'flex';
            this.elements.finalWpm.textContent = last.wpm;
            this.elements.finalAccuracy.textContent = last.accuracy;
            this.elements.practiceBtn.textContent = "Try Again";
        } else {
            this.elements.summaryTitle.textContent = "Session Ended";
            this.elements.summarySubtitle.textContent = "Your note is ready. Keep it up!";
            this.elements.resultDisplay.style.display = 'none';
            this.elements.practiceBtn.textContent = "Practice Typing This Note";
        }
        this.applySettings();
    },

    // Data Handling
    saveNote(silent = false) {
        this.state.currentNote = this.elements.noteTextarea.value.trim();
        localStorage.setItem('typing_note_latest', this.state.currentNote);

        if (silent) {
            this.elements.statusBadge.style.display = 'block';
            this.elements.statusBadge.style.opacity = '1';
            setTimeout(() => { this.elements.statusBadge.style.opacity = '0'; }, 1000);
        }
    },

    saveSession() {
        if (!this.state.settings.historyEnabled) return;
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            wpm: parseInt(this.elements.wpmDisplay.textContent),
            accuracy: parseInt(this.elements.accuracyDisplay.textContent),
            length: this.state.currentNote.length
        };
        this.state.sessions.unshift(session);
        this.state.sessions = this.state.sessions.slice(0, 10);
        localStorage.setItem('typing_sessions', JSON.stringify(this.state.sessions));
    },

    loadSessions() {
        const saved = localStorage.getItem('typing_sessions');
        this.state.sessions = saved ? JSON.parse(saved) : [];
    },

    resetSession() {
        if (this.state.settings.clearSession) {
            this.state.currentNote = '';
            this.elements.noteTextarea.value = '';
        }
        this.elements.noteTextarea.disabled = false;
        this.elements.practiceTextarea.value = '';
        this.elements.wpmDisplay.textContent = '0';
        this.elements.accuracyDisplay.textContent = '100';
        this.state.typingStarted = false;
        this.state.startTime = null;
        document.body.classList.remove('no-scroll');
    },

    // Typing Practice Engine
    startPractice() {
        this.state.currentNote = localStorage.getItem('typing_note_latest') || '';
        this.renderReference();
        this.elements.practiceTextarea.value = '';
        this.elements.wpmDisplay.textContent = '0';
        this.elements.accuracyDisplay.textContent = '100';
        this.state.typingStarted = false;
        this.state.startTime = null;
        this.state.lastWpmUpdate = 0;
        document.body.classList.add('no-scroll');
        this.showScreen('practice-screen');
    },

    renderReference() {
        const text = this.state.currentNote;
        this.elements.referenceText.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            this.elements.referenceText.appendChild(span);
        });
        if (this.elements.referenceText.children.length > 0) {
            this.elements.referenceText.children[0].classList.add('char-current');
        }
    },

    handleTyping(e) {
        const input = e.target.value;
        const target = this.state.currentNote;
        const spans = this.elements.referenceText.children;

        if (!this.state.typingStarted && input.length > 0) {
            this.state.typingStarted = true;
            this.state.startTime = Date.now();
            this.state.lastWpmUpdate = Date.now();
        }

        // Precise character highlighting
        for (let i = 0; i < spans.length; i++) {
            const charSpan = spans[i];
            charSpan.classList.remove('char-correct', 'char-incorrect', 'char-current');

            if (i < input.length) {
                if (input[i] === target[i]) {
                    charSpan.classList.add('char-correct');
                } else {
                    charSpan.classList.add('char-incorrect');
                }
            } else if (i === input.length) {
                charSpan.classList.add('char-current');
                // Auto-scroll logic
                charSpan.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }

        this.updateStats(input, target);
        if (input.length >= target.length && Math.round((this.getCorrectChars(input, target) / input.length) * 100) === 100) {
            this.elements.finishPracticeBtn.click();
        }
    },

    getCorrectChars(input, target) {
        let correct = 0;
        for (let i = 0; i < input.length; i++) {
            if (i < target.length && input[i] === target[i]) correct++;
        }
        return correct;
    },

    updateStats(input, target) {
        if (input.length === 0) {
            this.elements.accuracyDisplay.textContent = '100';
            this.elements.wpmDisplay.textContent = '0';
            return;
        }
        const now = Date.now();
        if (this.state.startTime && (now - this.state.lastWpmUpdate > this.state.wpmInterval)) {
            const timeElapsed = (now - this.state.startTime) / 1000 / 60;
            if (timeElapsed > 0) {
                const wpm = Math.round((input.length / 5) / timeElapsed);
                this.elements.wpmDisplay.textContent = Math.max(0, wpm);
                this.state.lastWpmUpdate = now;
            }
        }
        const accuracy = Math.round((this.getCorrectChars(input, target) / input.length) * 100);
        this.elements.accuracyDisplay.textContent = Math.min(100, Math.max(0, accuracy));
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

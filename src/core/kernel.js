import { bus } from './event-bus.js';
import { db } from '../data/db.js';
import { APP_CONFIG } from './config.js';
import EditorModule from '../modules/editor/index.js';
import FileSystemModule from '../modules/filesystem/index.js';
import SearchModule from '../modules/search/index.js';

class Kernel {
    constructor() {
        this.modules = new Map();
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        console.log(`Kernel: Booting ${APP_CONFIG.name} v${APP_CONFIG.version}...`);

        try {
            // 1. Initialize Database
            await db.init();
            console.log('Kernel: Database ready.');

            // 2. Load Core Modules
            this.registerModule('editor', EditorModule);
            EditorModule.init();

            this.registerModule('filesystem', FileSystemModule);
            FileSystemModule.init();

            this.registerModule('search', SearchModule);
            SearchModule.init();

            // 3. Signal Ready
            this.isInitialized = true;
            bus.emit('app:ready', { timestamp: Date.now() });
            console.log('Kernel: System Ready.');
        } catch (error) {
            console.error('Kernel: Boot failed', error);
            bus.emit('app:error', error);
        }
    }

    registerModule(name, moduleInstance) {
        this.modules.set(name, moduleInstance);
        console.log(`Kernel: Module registered -> ${name}`);
    }
}

export const kernel = new Kernel();

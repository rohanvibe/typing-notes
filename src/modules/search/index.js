import { bus } from '../../core/event-bus.js';
import { db, STORES } from '../../data/db.js';
import FlexSearch from 'flexsearch';

export class SearchModule {
    constructor() {
        this.name = 'search';
        // Document index for full-text search
        this.index = new FlexSearch.Document({
            document: {
                id: "id",
                index: ["title", "content"],
                store: true
            }
        });
    }

    init() {
        console.log('Search Module Initialized');
        // Listen for data changes to update index
        bus.on('note:create', (note) => this.addToIndex(note));
        bus.on('note:save', (note) => this.updateIndex(note));
        bus.on('db:delete', (data) => {
            if (data.store === STORES.NOTES) this.removeFromIndex(data.key);
        });

        // Initial indexing
        this.buildIndex();

        // Expose global search method via bus
        bus.on('search:query', (query) => this.search(query));
    }

    async buildIndex() {
        const notes = await db.getAll(STORES.NOTES);
        notes.forEach(note => this.addToIndex(note));
        console.log(`Search: Indexed ${notes.length} notes`);
    }

    addToIndex(note) {
        this.index.add(note);
    }

    updateIndex(note) {
        this.index.update(note);
    }

    removeFromIndex(id) {
        this.index.remove(id);
    }

    search(query) {
        const results = this.index.search(query, { limit: 10 });
        // Flexsearch returns results grouped by field, flatten them
        const hits = new Set();
        results.forEach(fieldResult => {
            fieldResult.result.forEach(id => hits.add(id));
        });

        console.log('Search Results:', results);
        bus.emit('search:results', Array.from(hits));
    }
}

export default new SearchModule();

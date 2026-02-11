export const APP_CONFIG = {
    name: 'Typing Notes',
    version: '2.0.0',
    dbName: 'typing-notes-db',
    syncInterval: 5 * 60 * 1000, // 5 minutes
    modules: [
        'editor',
        'filesystem',
        'settings'
    ]
};

import { v4 as uuidv4 } from 'uuid';

export const Schema = {
    createNote(title = 'Untitled', content = '', folderId = null) {
        const now = new Date().toISOString();
        return {
            id: uuidv4(),
            title,
            content, // Markdown string or JSON
            folderId,
            tags: [],
            is_pinned: false,
            is_favorite: false,
            created_at: now,
            updated_at: now
        };
    },

    createFolder(name, parentId = null) {
        return {
            id: uuidv4(),
            name,
            parentId,
            color: '#007aff',
            icon: 'folder',
            created_at: new Date().toISOString()
        };
    }
};

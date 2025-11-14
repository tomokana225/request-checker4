import { Song } from '../types';

const extractKana = (text: string): { main: string; kana?: string } => {
    const match = text.match(/(.+?)\s*[(（](.+?)[)）]/);
    if (match) {
        return {
            main: match[1].trim(),
            kana: match[2].trim()
        };
    }
    return { main: text.trim() };
};

export const parseSongs = (str: string): Song[] => {
    if (!str) return [];
    // FIX: Add a return type annotation `Song | null` to the map callback. This correctly types the
    // resulting array and resolves an error in the subsequent `.filter()` type predicate where the
    // inferred anonymous object type was not assignable to the `Song` type.
    return str.replace(/\r\n/g, '\n').split('\n').map((line): Song | null => {
        if (!line.trim()) return null;
        const parts = line.split(',');
        if (parts.length < 2 || !parts[0] || !parts[1]) return null;
        
        const titleParts = extractKana(parts[0]);
        const artistParts = extractKana(parts[1]);

        // FIX: Explicitly type `status` to match the `Song` interface. This helps TypeScript
        // correctly infer the type from the ternary expression, resolving an assignability error.
        const status: 'playable' | 'practicing' = parts[4]?.trim()?.toLowerCase() === '練習中' ? 'practicing' : 'playable';

        return {
            title: titleParts.main,
            artist: artistParts.main,
            titleKana: titleParts.kana,
            artistKana: artistParts.kana,
            genre: parts[2]?.trim() || '',
            isNew: parts[3]?.trim()?.toLowerCase() === 'new',
            status: status,
        };
    }).filter((song): song is Song => song !== null);
};

export const songsToString = (songs: Song[]): string => {
    return songs.map(song => {
        const titleWithKana = song.titleKana ? `${song.title} (${song.titleKana})` : song.title;
        const artistWithKana = song.artistKana ? `${song.artist} (${song.artistKana})` : song.artist;
        const parts = [titleWithKana, artistWithKana, song.genre || ''];
        
        let fourthPart = '';
        if (song.isNew) {
            fourthPart = 'new';
        }
        
        let fifthPart = '';
        if (song.status === 'practicing') {
            fifthPart = '練習中';
        }

        // To maintain comma structure, push even if empty
        parts.push(fourthPart);
        parts.push(fifthPart);
        
        // Trim trailing empty parts for cleaner output
        while (parts.length > 2 && !parts[parts.length - 1]) {
            parts.pop();
        }
        
        return parts.join(',');
    }).join('\n');
};
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Song, SearchResult } from '../types';
import { normalizeForSearch } from '../utils/normalization';
import { SearchIcon, XIcon, PlusIcon } from '../components/ui/Icons';
import { SongCard } from '../components/ui/SongCard';
import { RequestSongModal } from '../features/suggest/RequestSongModal';

interface SearchViewProps {
    songs: Song[];
    logSearch: (term: string) => void;
    logRequest: (term: string, requester: string) => Promise<void>;
    refreshRankings: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const SEARCH_DEBOUNCE_MS = 300;
const MAX_RELATED_SONGS = 5;

export const SearchView: React.FC<SearchViewProps> = ({ songs, logSearch, logRequest, refreshRankings, searchTerm, setSearchTerm }) => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);
    
    const normalizedSongs = useMemo(() => {
        return songs.map(song => ({
            original: song,
            normalizedTitle: normalizeForSearch(song.title),
            normalizedArtist: normalizeForSearch(song.artist)
        }));
    }, [songs]);

    const performSearch = useCallback((term: string) => {
        if (!term.trim()) {
            setSearchResult(null);
            return;
        }

        const normalizedTerm = normalizeForSearch(term);
        logSearch(normalizedTerm);
        
        let exactMatches: Song[] = [];
        let titleMatches: Song[] = [];
        let artistMatches: Song[] = [];
        
        for (const s of normalizedSongs) {
            if (s.normalizedTitle.includes(normalizedTerm) || s.normalizedArtist.includes(normalizedTerm)) {
                if (s.normalizedTitle === normalizedTerm || s.normalizedArtist === normalizedTerm) {
                    exactMatches.push(s.original);
                } else if (s.normalizedTitle.includes(normalizedTerm)) {
                    titleMatches.push(s.original);
                } else {
                    artistMatches.push(s.original);
                }
            }
        }
        
        const foundSongs = [...exactMatches, ...titleMatches, ...artistMatches];

        if (foundSongs.length > 0) {
            setSearchResult({ status: 'found', songs: foundSongs, searchTerm: term });
        } else {
            const relatedSongs: Song[] = [];
            setSearchResult({ 
                status: relatedSongs.length > 0 ? 'related' : 'notFound', 
                songs: relatedSongs.slice(0, MAX_RELATED_SONGS), 
                searchTerm: term 
            });
        }

    }, [logSearch, normalizedSongs]);

    useEffect(() => {
        performSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, performSearch]);
    
    const handleRequestSuccess = () => {
        refreshRankings();
    };

    const renderResult = () => {
        if (!searchResult) {
            return (
                <div className="text-center text-gray-400 mt-8">
                    <p>曲名やアーティスト名で検索してください。</p>
                </div>
            );
        }

        switch (searchResult.status) {
            case 'found':
                return (
                    <div className="mt-6 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-center">「<span className="text-cyan-400">{searchResult.searchTerm}</span>」の検索結果: {searchResult.songs.length}件</h2>
                        <div className="space-y-3">
                            {searchResult.songs.map((song, index) => <SongCard key={`${song.title}-${index}`} song={song} />)}
                        </div>
                    </div>
                );
            case 'notFound':
                return (
                    <div className="text-center text-gray-300 mt-8 p-6 bg-gray-800 rounded-lg animate-fade-in">
                        <p className="mb-4">「<span className="font-bold text-cyan-400">{searchResult.searchTerm}</span>」は見つかりませんでした。</p>
                        <button onClick={() => setIsRequestModalOpen(true)} className="flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-transform transform hover:scale-105">
                           <PlusIcon className="w-5 h-5" /> この曲をリクエストする
                        </button>
                    </div>
                );
            case 'related':
                 return (
                    <div className="mt-6 animate-fade-in">
                        <p className="text-center text-gray-300 mb-4">「<span className="font-bold text-cyan-400">{searchResult.searchTerm}</span>」は見つかりませんでした。もしかして...</p>
                        <div className="space-y-3">
                            {searchResult.songs.map((song, index) => <SongCard key={`${song.title}-${index}`} song={song} />)}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="曲名 or アーティスト名"
                    className="w-full bg-gray-700 border border-gray-600 rounded-full py-3 pl-12 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            {renderResult()}
            {isRequestModalOpen && searchResult?.searchTerm && (
                 <RequestSongModal 
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    songTitle={searchResult.searchTerm}
                    logRequest={logRequest}
                    onSuccess={handleRequestSuccess}
                />
            )}
        </div>
    );
};

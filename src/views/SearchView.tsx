import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Song, SearchResult, UiConfig, RankingItem, Mode } from '../types';
import { normalizeForSearch } from '../utils/normalization';
import { SearchIcon, XIcon, PlusIcon, DocumentTextIcon, MusicNoteIcon, NewspaperIcon, LightBulbIcon, CloudUploadIcon, ChevronRightIcon } from '../components/ui/Icons';
import { SongCard } from '../components/ui/SongCard';
import { RequestSongModal } from '../features/suggest/RequestSongModal';

interface SearchViewProps {
    songs: Song[];
    logSearch: (term: string) => void;
    logLike: (term: string, artist: string) => Promise<void>;
    logRequest: (term: string, artist: string, requester: string) => Promise<void>;
    refreshRankings: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onAdminLogin: () => void;
    uiConfig: UiConfig;
    songRankingList: RankingItem[];
    setMode: (mode: Mode) => void;
    openSuggestModal: () => void;
}

const MAX_RELATED_SONGS = 5;

const NavCard: React.FC<{
    icon: React.FC<{ className?: string, style?: React.CSSProperties }>;
    title: string;
    onClick: () => void;
}> = ({ icon: Icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="group w-full flex items-center gap-2 p-3 sm:gap-4 sm:p-4 rounded-xl bg-card-background-light/80 dark:bg-card-background-dark/80 backdrop-blur-sm border border-border-light dark:border-border-dark shadow-md hover:shadow-lg hover:border-[var(--primary-color)] transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] dark:focus:ring-offset-card-background-dark"
    aria-label={title}
  >
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors duration-300 bg-[var(--primary-color)]/10 group-hover:bg-[var(--primary-color)]/20 flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300" style={{ color: 'var(--primary-color)' }} />
    </div>
    <h3 className="font-bold text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark text-left">{title}</h3>
    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-text-secondary-light/70 dark:text-text-secondary-dark/70 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--primary-color)] flex-shrink-0" />
  </button>
);


export const SearchView: React.FC<SearchViewProps> = ({ songs, logSearch, logLike, logRequest, refreshRankings, searchTerm, setSearchTerm, onAdminLogin, uiConfig, songRankingList, setMode, openSuggestModal }) => {
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Song[]>([]);
    const [isLiking, setIsLiking] = useState<string | null>(null);
    const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
    const [likeMessage, setLikeMessage] = useState('');
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const initialSearchTermRef = useRef(searchTerm);

    const popularSongs = useMemo(() => {
        return songRankingList
            .slice(0, 5) // Top 5
            .map(rankItem => songs.find(s => s.title === rankItem.id && s.artist === rankItem.artist))
            .filter((s): s is Song => !!s);
    }, [songRankingList, songs]);

    const normalizedSongs = useMemo(() => {
        return songs.map(song => ({
            original: song,
            normalizedTitle: normalizeForSearch(song.title),
            normalizedArtist: normalizeForSearch(song.artist),
            normalizedTitleKana: normalizeForSearch(song.titleKana || ''),
            normalizedArtistKana: normalizeForSearch(song.artistKana || '')
        }));
    }, [songs]);

    // Update suggestions based on search term
    useEffect(() => {
        // Don't show suggestions if a search has been executed and the term hasn't changed
        if (searchResult && normalizeForSearch(searchTerm) === normalizeForSearch(searchResult.searchTerm)) {
            setSuggestions([]);
            return;
        }

        if (searchTerm.trim().length > 1) {
            const normalizedTerm = normalizeForSearch(searchTerm);
            const filteredSuggestions = normalizedSongs
                .filter(s => 
                    s.normalizedTitle.includes(normalizedTerm) || 
                    s.normalizedArtist.includes(normalizedTerm) ||
                    s.normalizedTitleKana.includes(normalizedTerm) ||
                    s.normalizedArtistKana.includes(normalizedTerm)
                )
                .map(s => s.original)
                .slice(0, 10); // Limit to 10 suggestions
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, normalizedSongs, searchResult]);

    const performSearch = useCallback((term: string) => {
        if (term.trim().toLowerCase() === 'admin') {
            onAdminLogin();
            setSearchTerm(''); 
            setSuggestions([]);
            setSearchResult(null);
            return;
        }
        
        if (!term.trim()) {
            setSearchResult(null);
            return;
        }

        setSuggestions([]); // Hide suggestions after search
        const normalizedTerm = normalizeForSearch(term);
        logSearch(normalizedTerm);
        
        let exactMatches: Song[] = [];
        let titleMatches: Song[] = [];
        let artistMatches: Song[] = [];
        
        for (const s of normalizedSongs) {
            const isMatch = s.normalizedTitle.includes(normalizedTerm) || 
                            s.normalizedArtist.includes(normalizedTerm) ||
                            s.normalizedTitleKana.includes(normalizedTerm) ||
                            s.normalizedArtistKana.includes(normalizedTerm);

            if (isMatch) {
                const isExactMatch = s.normalizedTitle === normalizedTerm || 
                                     s.normalizedArtist === normalizedTerm ||
                                     s.normalizedTitleKana === normalizedTerm ||
                                     s.normalizedArtistKana === normalizedTerm;

                if (isExactMatch) {
                    exactMatches.push(s.original);
                } else if (s.normalizedTitle.includes(normalizedTerm) || s.normalizedTitleKana.includes(normalizedTerm)) {
                    titleMatches.push(s.original);
                } else {
                    artistMatches.push(s.original);
                }
            }
        }
        
        const foundSongs = [...new Set([...exactMatches, ...titleMatches, ...artistMatches])];

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

    }, [logSearch, normalizedSongs, onAdminLogin, setSearchTerm]);
    
    useEffect(() => {
        // If the view is loaded with a pre-existing search term (e.g., from the suggest modal),
        // perform the search immediately on mount. This only runs once.
        if (initialSearchTermRef.current.trim()) {
            performSearch(initialSearchTermRef.current);
        }
    }, [performSearch]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const showLikeMessage = (msg: string) => {
        setLikeMessage(msg);
        setTimeout(() => setLikeMessage(''), 4000);
    };

    const handleLike = async (song: Song) => {
        if (likedSongs.has(song.title)) return;
        setIsLiking(song.title);
        await logLike(song.title, song.artist);
        setLikedSongs(prev => new Set(prev).add(song.title));
        await refreshRankings();
        setIsLiking(null);
        showLikeMessage(`「${song.title}」にいいねしました！`);
    };

    const handleRequestSuccess = () => {
        setSearchResult(null);
        setSearchTerm('');
        refreshRankings();
    };

    const renderResult = () => {
        if (!searchResult) return null;

        const { status, songs: resultSongs, searchTerm: term } = searchResult;
        
        return (
            <div className="mt-8 animate-fade-in">
                <h2 className="text-xl font-semibold mb-4 text-center">
                    {status === 'found' ? `「${term}」の検索結果` : `「${term}」は見つかりませんでした`}
                </h2>
                {status === 'found' && (
                    <div className="space-y-3">
                        {resultSongs.map((song, index) => 
                            <SongCard 
                                key={`${song.title}-${index}`} 
                                song={song} 
                                onLike={handleLike} 
                                isLiking={isLiking === song.title}
                                isLiked={likedSongs.has(song.title)}
                            />
                        )}
                    </div>
                )}
                
                {(status === 'notFound' || status === 'related') && (
                    <div className="text-center p-6 bg-input-bg-light dark:bg-card-background-dark/50 rounded-lg">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                            この曲はまだレパートリーにありません。
                        </p>
                        <button 
                            onClick={() => setIsRequestModalOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-transform transform hover:scale-105"
                        >
                            <PlusIcon className="w-5 h-5" />
                            この曲をリクエストする
                        </button>
                    </div>
                )}
                 <RequestSongModal 
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    songTitle={term}
                    logRequest={logRequest}
                    onSuccess={handleRequestSuccess}
                    uiConfig={uiConfig}
                />
            </div>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="relative" ref={searchContainerRef}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
                </div>
                <input
                    type="search"
                    placeholder={uiConfig.subtitle}
                    className="w-full pl-12 pr-10 py-4 text-base sm:text-lg border-2 border-border-light dark:border-border-dark bg-input-bg-light dark:bg-input-bg-dark rounded-full focus:outline-none focus:ring-2"
                    style={{'--tw-ring-color': 'var(--primary-color)'} as React.CSSProperties}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performSearch(searchTerm)}
                    aria-label="曲を検索"
                />
                {searchTerm && (
                    <button onClick={() => { setSearchTerm(''); setSearchResult(null); }} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <XIcon className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
                    </button>
                )}
                
                {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-card-background-light dark:bg-card-background-dark rounded-lg shadow-lg border border-border-light dark:border-border-dark max-h-60 overflow-y-auto custom-scrollbar">
                        <ul>
                            {suggestions.map((song, index) => (
                                <li key={index}>
                                    <button 
                                        onClick={() => { setSearchTerm(song.title); performSearch(song.title); }}
                                        className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10"
                                    >
                                        <span className="font-semibold">{song.title}</span>
                                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark ml-2">- {song.artist}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
             {likeMessage && (
                <div className="text-center text-green-500 dark:text-green-400 h-6 mt-2 flex items-center justify-center">
                    {likeMessage}
                </div>
             )}

            {searchResult ? renderResult() : (
                <>
                    <div className="grid grid-cols-2 gap-4 mt-12 animate-fade-in">
                        <NavCard 
                            icon={MusicNoteIcon}
                            title="曲リスト"
                            onClick={() => setMode('list')}
                        />
                        <NavCard 
                            icon={NewspaperIcon}
                            title="お知らせ"
                            onClick={() => setMode('news')}
                        />
                        <NavCard 
                            icon={LightBulbIcon}
                            title="おまかせ選曲"
                            onClick={openSuggestModal}
                        />
                        <NavCard 
                            icon={CloudUploadIcon}
                            title="リクエスト"
                            onClick={() => setMode('requests')}
                        />
                    </div>
                    
                    {popularSongs.length > 0 && (
                        <div className="mt-12 animate-fade-in">
                            <h2 className="text-xl font-semibold mb-4 text-center">人気の曲</h2>
                            <div className="space-y-3">
                                {popularSongs.map((song) => (
                                    <SongCard 
                                        key={song.title} 
                                        song={song} 
                                        onLike={handleLike} 
                                        isLiking={isLiking === song.title}
                                        isLiked={likedSongs.has(song.title)}
                                    />
                                ))}
                            </div>
                             <div className="text-center mt-6">
                                <button
                                    onClick={() => setMode('ranking')}
                                    className="font-semibold transition-opacity hover:opacity-75"
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    すべてのランキングを見る →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
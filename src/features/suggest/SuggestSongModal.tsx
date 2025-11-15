import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song } from '../../types';
import { XIcon, YouTubeIcon, DocumentTextIcon } from '../../components/ui/Icons';

interface SuggestSongModalProps {
    isOpen: boolean;
    onClose: () => void;
    songs: Song[];
    onSelect: (text: string) => void;
}

type GamePhase = 'idle' | 'spinning' | 'result';

export const SuggestSongModal: React.FC<SuggestSongModalProps> = ({ isOpen, onClose, songs, onSelect }) => {
    const [suggestedSong, setSuggestedSong] = useState<Song | null>(null);
    const [flickerSong, setFlickerSong] = useState<Song | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
    const intervalRef = useRef<number | null>(null);

    const startSpin = useCallback(() => {
        if (songs.length === 0) return;

        setIsCopied(false);
        setGamePhase('spinning');
        setSuggestedSong(null);

        intervalRef.current = window.setInterval(() => {
            const randomIndex = Math.floor(Math.random() * songs.length);
            setFlickerSong(songs[randomIndex]);
        }, 80);

        setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            const finalSongIndex = Math.floor(Math.random() * songs.length);
            const finalSong = songs[finalSongIndex];
            setSuggestedSong(finalSong);
            setFlickerSong(null);
            setGamePhase('result');
        }, 2000); // Spin for 2 seconds

    }, [songs]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Reset state when the modal is closed
        if (!isOpen) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setGamePhase('idle');
            setSuggestedSong(null);
            setFlickerSong(null);
            setIsCopied(false);
        }
    }, [isOpen]);


    const handleCopy = () => {
        if (suggestedSong) {
            const textToCopy = `${suggestedSong.title} / ${suggestedSong.artist}`;
            onSelect(textToCopy);
            setIsCopied(true);
        }
    };
    
    if (!isOpen) return null;

    const displaySong = flickerSong || suggestedSong;
    
    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card-background-light dark:bg-card-background-dark rounded-lg shadow-2xl w-full max-w-md text-center p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark" disabled={gamePhase === 'spinning'}>
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-4">ランダムルーレット</h2>
                
                {/* Slot machine UI */}
                <div className="h-32 w-full flex items-center justify-center p-4 my-6 text-center bg-gray-200 dark:bg-gray-900 rounded-lg border border-border-light dark:border-border-dark">
                    {gamePhase === 'idle' && (
                        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">何にする？</p>
                    )}
                    {gamePhase === 'spinning' && displaySong && (
                        <div className="animate-slot-flicker">
                            <h3 className="text-3xl font-bold" style={{color: 'var(--primary-color)'}}>{displaySong.title}</h3>
                            <p className="text-lg text-text-primary-light dark:text-text-primary-dark">{displaySong.artist}</p>
                        </div>
                    )}
                    {gamePhase === 'result' && displaySong && (
                         <div className="animate-slot-result-pop">
                             <h3 className="text-4xl font-bold" style={{color: 'var(--primary-color)'}}>{displaySong.title}</h3>
                            <p className="text-xl text-text-primary-light dark:text-text-primary-dark">{displaySong.artist}</p>
                        </div>
                    )}
                </div>

                {/* Action buttons appear below only on result */}
                <div className="h-10 mb-4">
                    {gamePhase === 'result' && suggestedSong && (
                        <div className="flex items-center justify-center gap-4 animate-fade-in">
                             <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${suggestedSong.artist} ${suggestedSong.title}`)}`} target="_blank" rel="noopener noreferrer" title="YouTubeで検索" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
                                <YouTubeIcon className="w-6 h-6 text-red-600 hover:text-red-500" />
                            </a>
                            <a href={`https://www.google.com/search?q=${encodeURIComponent(`${suggestedSong.artist} ${suggestedSong.title} 歌詞`)}`} target="_blank" rel="noopener noreferrer" title="歌詞を検索" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
                                <DocumentTextIcon className="w-6 h-6" />
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {gamePhase === 'idle' ? (
                        <button onClick={startSpin} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow">
                            スタート
                        </button>
                    ) : (
                        <button onClick={startSpin} disabled={gamePhase === 'spinning'} className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow">
                            もう一回
                        </button>
                    )}
                    <button onClick={handleCopy} disabled={gamePhase !== 'result'} className="text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow" style={{backgroundColor: 'var(--primary-color)'}}>
                        {isCopied ? 'コピーしました！' : 'この曲をコピー'}
                    </button>
                </div>
            </div>
        </div>
    );
};
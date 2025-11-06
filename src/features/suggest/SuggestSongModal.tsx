import React, { useState, useEffect, useCallback } from 'react';
import { Song } from '../../types';
import { XIcon, YouTubeIcon, DocumentTextIcon } from '../../components/ui/Icons';

interface SuggestSongModalProps {
    isOpen: boolean;
    onClose: () => void;
    songs: Song[];
    onSelect: (text: string) => void;
}

type GamePhase = 'idle' | 'spinning' | 'result';
const REEL_ITEMS_COUNT = 30; // Number of items to show in the reel animation
const SPIN_DURATION_MS = 2500; // How long the spin animation lasts

export const SuggestSongModal: React.FC<SuggestSongModalProps> = ({ isOpen, onClose, songs, onSelect }) => {
    const [suggestedSong, setSuggestedSong] = useState<Song | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
    
    // State for the reels
    const [reel1Items, setReel1Items] = useState<Song[]>([]);
    const [reel2Items, setReel2Items] = useState<Song[]>([]);
    const [reel1Position, setReel1Position] = useState(0);
    const [reel2Position, setReel2Position] = useState(0);

    const startSpin = useCallback(() => {
        if (songs.length === 0) return;

        setIsCopied(false);
        setGamePhase('spinning');
        
        // Pick the final song
        const finalSongIndex = Math.floor(Math.random() * songs.length);
        const finalSong = songs[finalSongIndex];

        // Prepare items for the reels
        const createReelData = (items: Song[]) => {
            const reelData = [];
            for (let i = 0; i < REEL_ITEMS_COUNT - 1; i++) {
                reelData.push(items[Math.floor(Math.random() * items.length)]);
            }
            reelData.push(finalSong); // Ensure the final song is the last item
            return reelData;
        };

        setReel1Items(createReelData(songs));
        setReel2Items(createReelData(songs));

        // Reset positions before spinning
        setReel1Position(0);
        setReel2Position(0);

        // We use a timeout to allow React to render the initial state before applying the transition
        setTimeout(() => {
            const reelItemHeight = 64; // Corresponds to h-16 in Tailwind
            const finalPosition = (REEL_ITEMS_COUNT - 1) * reelItemHeight;
            
            // Stagger the reel stops for dramatic effect
            setReel1Position(finalPosition);
            setTimeout(() => setReel2Position(finalPosition), 400);

            // Set the final result after the animation completes
            setTimeout(() => {
                setGamePhase('result');
                setSuggestedSong(finalSong);
            }, SPIN_DURATION_MS + 500);
        }, 100);

    }, [songs]);

    useEffect(() => {
        // Reset state when the modal is closed
        if (!isOpen) {
            setGamePhase('idle');
            setSuggestedSong(null);
            setIsCopied(false);
            setReel1Position(0);
            setReel2Position(0);
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

    const transitionClasses = `transition-transform duration-[${SPIN_DURATION_MS}ms] ease-[cubic-bezier(0.25,1,0.5,1)]`;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md text-center p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white" disabled={gamePhase === 'spinning'}>
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">ランダムルーレット</h2>
                
                {/* Slot machine UI */}
                <div className="relative h-16 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center p-4 my-6 text-center shadow-inner">
                    {/* Gradient overlays for realism */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-gray-100 dark:from-gray-900/50 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-100 dark:from-gray-900/50 to-transparent z-10 pointer-events-none"></div>
                    
                    {gamePhase === 'idle' && (
                        <p className="text-lg text-gray-500 dark:text-gray-400">何にする？</p>
                    )}

                    {(gamePhase === 'spinning' || gamePhase === 'result') && (
                        <div className="flex w-full h-full justify-between items-center overflow-hidden">
                            {/* Reel 1: Title */}
                            <div className="w-1/2 h-full overflow-hidden relative">
                                <div className={`absolute top-0 left-0 w-full ${transitionClasses}`} style={{ transform: `translateY(-${reel1Position}px)` }}>
                                    {reel1Items.map((song, index) => (
                                        <div key={index} className="h-16 flex items-center justify-center">
                                            <p className="text-xl font-bold truncate" style={{color: 'var(--primary-color)'}}>{song.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Reel 2: Artist */}
                            <div className="w-1/2 h-full overflow-hidden relative">
                                <div className={`absolute top-0 left-0 w-full ${transitionClasses}`} style={{ transform: `translateY(-${reel2Position}px)` }}>
                                    {reel2Items.map((song, index) => (
                                        <div key={index} className="h-16 flex items-center justify-center">
                                             <p className="text-md text-gray-700 dark:text-gray-300 truncate">{song.artist}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action buttons appear below only on result */}
                <div className="h-10 mb-4">
                    {gamePhase === 'result' && suggestedSong && (
                        <div className="flex items-center justify-center gap-4 animate-fade-in">
                             <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${suggestedSong.artist} ${suggestedSong.title}`)}`} target="_blank" rel="noopener noreferrer" title="YouTubeで検索" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                                <YouTubeIcon className="w-6 h-6 text-red-600 hover:text-red-500" />
                            </a>
                            <a href={`https://www.google.com/search?q=${encodeURIComponent(`${suggestedSong.artist} ${suggestedSong.title} 歌詞`)}`} target="_blank" rel="noopener noreferrer" title="歌詞を検索" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                                <DocumentTextIcon className="w-6 h-6" />
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {gamePhase === 'idle' ? (
                        <button onClick={startSpin} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                            スタート
                        </button>
                    ) : (
                        <button onClick={startSpin} disabled={gamePhase === 'spinning'} className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            もう一回
                        </button>
                    )}
                    <button onClick={handleCopy} disabled={gamePhase !== 'result'} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" style={{backgroundColor: 'var(--primary-color)'}}>
                        {isCopied ? 'コピーしました！' : 'この曲をコピー'}
                    </button>
                </div>
            </div>
        </div>
    );
};
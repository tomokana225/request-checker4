import React from 'react';
import { Song } from '../../types';
import { YouTubeIcon, DocumentTextIcon, HeartIcon, HeartIconSolid } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

interface SongCardProps {
    song: Song;
    onLike?: (song: Song) => void;
    isLiking?: boolean;
    isLiked?: boolean;
}

const ActionButton = ({ href, title, icon }: { href: string, title: string, icon: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors">
        {icon}
    </a>
);

export const SongCard: React.FC<SongCardProps> = ({ song, onLike, isLiking, isLiked }) => {
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.artist} ${song.title}`)}`;
    const lyricsSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${song.artist} ${song.title} 歌詞`)}`;

    return (
        <div className="bg-input-bg-light dark:bg-input-bg-dark p-3 sm:p-4 rounded-lg flex justify-between items-center border border-border-light dark:border-border-dark fancy-card shadow-sm">
            <div className="min-w-0 flex-grow">
                <h3 className="font-bold text-base sm:text-lg truncate text-text-primary-light dark:text-text-primary-dark">{song.title}</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">{song.artist}</p>
                 <div className="flex items-center gap-2 mt-2">
                    {song.isNew && <span className="text-xs font-semibold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">NEW</span>}
                    {song.status === 'practicing' && <span className="text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">練習中</span>}
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2 sm:ml-4">
                <ActionButton href={youtubeSearchUrl} title="YouTubeで検索" icon={<YouTubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 hover:text-red-400" />} />
                <ActionButton href={lyricsSearchUrl} title="歌詞を検索" icon={<DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />} />
                 {onLike && (
                    <button onClick={() => onLike(song)} disabled={isLiking || isLiked} className="p-1 sm:p-2 rounded-full hover:bg-pink-500/10 dark:hover:bg-pink-500/20 disabled:cursor-not-allowed" title={isLiked ? "いいね済み" : "いいね！"}>
                        {isLiking ? (
                            <LoadingSpinner className="w-5 h-5 text-pink-400" />
                        ) : isLiked ? (
                            <HeartIconSolid className="w-5 h-5 text-pink-500" />
                        ) : (
                            <HeartIcon className="w-5 h-5 text-pink-400" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
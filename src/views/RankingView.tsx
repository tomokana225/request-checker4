import React, { useState } from 'react';
import { RankingItem, ArtistRankingItem, RequestRankingItem, RankingPeriod } from '../types';
import { TrendingUpIcon, YouTubeIcon, DocumentTextIcon } from '../components/ui/Icons';

interface RankingViewProps {
    songRankingList: RankingItem[];
    artistRankingList: ArtistRankingItem[];
    requestRankingList: RequestRankingItem[];
    period: RankingPeriod;
    setPeriod: (period: RankingPeriod) => void;
}

type RankingTab = 'song' | 'artist' | 'likes';

export const RankingView: React.FC<RankingViewProps> = ({ songRankingList, artistRankingList, requestRankingList, period, setPeriod }) => {
    const [activeTab, setActiveTab] = useState<RankingTab>('song');

    const getMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return <span className="font-bold text-gray-500 dark:text-gray-400">{rank}</span>;
    };
    
    const ActionButton: React.FC<{ href: string, title: string, icon: React.ReactNode }> = ({ href, title, icon }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            {icon}
        </a>
    );

    const TabButton: React.FC<{ tab: RankingTab, label: string }> = ({ tab, label }) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`w-full py-2.5 text-sm font-semibold rounded-md transition ${activeTab === tab ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            style={{backgroundColor: activeTab === tab ? 'var(--primary-color)' : ''}}
        >
            {label}
        </button>
    );

    const PeriodButton: React.FC<{ p: RankingPeriod, label: string }> = ({ p, label }) => (
        <button
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${period === p ? 'bg-gray-200 text-gray-900 font-bold dark:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
            {label}
        </button>
    );

    const renderSongRanking = () => (
        <div className="space-y-3">
            {songRankingList.slice(0, 10).map((item, index) => {
                const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.artist} ${item.id}`)}`;
                const lyricsSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${item.artist} ${item.id} 歌詞`)}`;
                return (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-4 flex-grow min-w-0">
                            <div className="text-2xl w-8 text-center flex-shrink-0">{getMedal(index + 1)}</div>
                            <div className="flex-grow min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{item.id}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.artist}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                            <ActionButton href={youtubeSearchUrl} title="YouTubeで検索" icon={<YouTubeIcon className="w-6 h-6 text-red-600 hover:text-red-500" />} />
                            <ActionButton href={lyricsSearchUrl} title="歌詞を検索" icon={<DocumentTextIcon className="w-5 h-5" />} />
                            <div className="text-sm sm:text-lg font-semibold text-cyan-600 dark:text-cyan-400 w-16 text-right flex-shrink-0">{item.count}回</div>
                        </div>
                    </div>
                )
            })}
        </div>
    );

    const renderArtistRanking = () => (
         <div className="space-y-3">
            {artistRankingList.slice(0, 10).map((item, index) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl w-8 text-center">{getMedal(index + 1)}</div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.id}</h3>
                        </div>
                    </div>
                    <div className="text-sm sm:text-lg font-semibold text-cyan-600 dark:text-cyan-400 w-16 text-right flex-shrink-0">{item.count}回</div>
                </div>
            ))}
        </div>
    );

    const renderLikesRanking = () => (
        <div className="space-y-3">
            {requestRankingList.slice(0, 10).map((item, index) => {
                const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.artist} ${item.id}`)}`;
                const lyricsSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${item.artist} ${item.id} 歌詞`)}`;
                return (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-4 flex-grow min-w-0">
                            <div className="text-2xl w-8 text-center flex-shrink-0">{getMedal(index + 1)}</div>
                            <div className="flex-grow min-w-0">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{item.id}</h3>
                                {item.artist && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.artist}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                            <ActionButton href={youtubeSearchUrl} title="YouTubeで検索" icon={<YouTubeIcon className="w-6 h-6 text-red-600 hover:text-red-500" />} />
                            <ActionButton href={lyricsSearchUrl} title="歌詞を検索" icon={<DocumentTextIcon className="w-5 h-5" />} />
                            <div className="text-sm sm:text-lg font-semibold text-pink-500 dark:text-pink-400 w-16 text-right flex-shrink-0">♡ {item.count}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    );


    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-3"><TrendingUpIcon className="w-8 h-8"/>人気曲ランキング</h2>
            </div>
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                    <TabButton tab="song" label="検索数" />
                    <TabButton tab="artist" label="アーティスト別" />
                    <TabButton tab="likes" label="いいね数" />
                </div>
                <div className="flex gap-2 p-1 bg-gray-300 dark:bg-gray-700 rounded-lg">
                    <PeriodButton p="all" label="総合" />
                    <PeriodButton p="month" label="月間" />
                    <PeriodButton p="year" label="年間" />
                </div>
            </div>

            {activeTab === 'song' && (songRankingList.length > 0 ? renderSongRanking() : <p className="text-center text-gray-500 dark:text-gray-400 mt-8">ランキングデータがありません。</p>)}
            {activeTab === 'artist' && (artistRankingList.length > 0 ? renderArtistRanking() : <p className="text-center text-gray-500 dark:text-gray-400 mt-8">ランキングデータがありません。</p>)}
            {activeTab === 'likes' && (requestRankingList.length > 0 ? renderLikesRanking() : <p className="text-center text-gray-500 dark:text-gray-400 mt-8">いいねされた曲はありません。</p>)}
        </div>
    );
};
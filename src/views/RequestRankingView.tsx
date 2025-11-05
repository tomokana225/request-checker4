import React from 'react';
import { RequestRankingItem } from '../types';
import { HeartIcon, YouTubeIcon, DocumentTextIcon } from '../components/ui/Icons';

interface RequestRankingViewProps {
    rankingList: RequestRankingItem[];
}

export const RequestRankingView: React.FC<RequestRankingViewProps> = ({ rankingList }) => {
    const getMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return <span className="font-bold text-gray-400">{rank}</span>;
    };
    
    const ActionButton: React.FC<{ href: string, title: string, icon: React.ReactNode }> = ({ href, title, icon }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="text-gray-400 hover:text-white transition-colors">
            {icon}
        </a>
    );

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-4 flex items-center justify-center gap-3">
                <HeartIcon className="w-8 h-8 text-pink-400"/>
                リクエストランキング
            </h2>
            <p className="text-center text-gray-400 mb-6 text-sm">
                このリストの曲は弾けるようになるかも？<br />
                楽譜があれば初見で弾ける可能性も！
            </p>

            {rankingList.length > 0 ? (
                <div className="space-y-3">
                    {rankingList.map((item, index) => {
                        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.id)}`;
                        const printGakufuUrl = `https://www.print-gakufu.com/search/result/keyword__${encodeURIComponent(item.id)}/`;

                        return (
                            <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-4 flex-grow min-w-0">
                                    <div className="text-2xl w-8 text-center flex-shrink-0">{getMedal(index + 1)}</div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-lg text-white truncate">{item.id}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                    <ActionButton href={youtubeSearchUrl} title="YouTubeで検索" icon={<YouTubeIcon className="w-6 h-6 text-red-600 hover:text-red-500" />} />
                                    <ActionButton href={printGakufuUrl} title="ぷりんと楽譜で検索" icon={<DocumentTextIcon className="w-5 h-5" />} />
                                    <div className="text-lg font-semibold text-pink-400 hidden sm:block">{item.count}票</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-400 mt-8">リクエストランキングデータを読み込んでいます...</p>
            )}
        </div>
    );
};

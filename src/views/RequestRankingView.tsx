import React, { useState } from 'react';
import { HeartIcon, CloudUploadIcon, ExternalLinkIcon } from '../components/ui/Icons';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { containsNGWord } from '../utils/validation';
import { RequestRankingItem } from '../types';

interface RequestRankingViewProps {
    recentRequests: RequestRankingItem[];
    logRequest: (term: string, artist: string, requester: string) => Promise<void>;
    refreshRankings: () => void;
}

const RequestForm: React.FC<{
    logRequest: (term: string, artist: string, requester: string) => Promise<void>;
    refreshRankings: () => void;
}> = ({ logRequest, refreshRankings }) => {
    const [songTitle, setSongTitle] = useState('');
    const [casId, setCasId] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sentMessage, setSentMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!songTitle.trim() || !casId.trim()) {
            alert('曲名とツイキャスアカウント名は必須です。');
            return;
        }
        if (containsNGWord(songTitle) || containsNGWord(casId)) {
            alert('不適切な単語が含まれているため、送信できません。');
            return;
        }
        setIsSending(true);
        await logRequest(songTitle, '', casId);
        setIsSending(false);
        setSentMessage(`「${songTitle}」をリクエストしました！`);
        setSongTitle('');
        // casId is kept for convenience
        refreshRankings();
        setTimeout(() => setSentMessage(''), 4000);
    };

    return (
        <div className="bg-input-bg-light dark:bg-card-background-dark/50 p-6 rounded-lg mb-8 border border-border-light dark:border-border-dark">
            <h3 className="text-xl font-bold text-center mb-4">リストにない曲をリクエスト</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="songTitle" className="block text-sm text-left font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">曲名 <span className="text-red-500">*</span></label>
                    <input
                        id="songTitle"
                        type="text"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="アイドル / YOASOBI"
                        required
                        className="w-full bg-card-background-light dark:bg-input-bg-dark border border-border-light dark:border-border-dark rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--primary-color)'} as React.CSSProperties}
                    />
                </div>
                <div>
                    <label htmlFor="casId_form" className="block text-sm text-left font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">ツイキャスアカウント名 <span className="text-red-500">*</span></label>
                    <input
                        id="casId_form"
                        type="text"
                        value={casId}
                        onChange={(e) => setCasId(e.target.value)}
                        placeholder="IDかアカウント名を入力"
                        required
                        className="w-full bg-card-background-light dark:bg-input-bg-dark border border-border-light dark:border-border-dark rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2"
                        style={{'--tw-ring-color': 'var(--primary-color)'} as React.CSSProperties}
                    />
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-left mt-1">配信者のみに公開されます。</p>
                </div>
                <div className="text-xs text-left text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-card-background-dark/50 p-3 rounded-md space-y-1">
                    <p>※リクエストに必ずお応えできるわけではありません。</p>
                    <p>※<a href="https://www.print-gakufu.com/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{color: 'var(--primary-color)'}}>「ぷりんと楽譜」<ExternalLinkIcon className="inline-block w-3 h-3"/></a>にある曲は初見で弾ける可能性があります。</p>
                </div>
                {sentMessage ? (
                    <p className="text-center text-green-600 h-12 flex items-center justify-center">{sentMessage}</p>
                ) : (
                    <button type="submit" disabled={isSending} className="w-full h-12 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed shadow">
                        {isSending ? <LoadingSpinner className="w-5 h-5"/> : <CloudUploadIcon className="w-5 h-5" />}
                        {isSending ? '送信中...' : 'この内容でリクエスト'}
                    </button>
                )}
            </form>
        </div>
    );
};

const RecentRequestsList: React.FC<{ requests: RequestRankingItem[] }> = ({ requests }) => {
    const formatDate = (timestamp?: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="mt-12">
            <h3 className="text-xl font-bold text-center mb-4">最近のリクエスト</h3>
            {requests && requests.length > 0 ? (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <div key={`${req.id}-${req.lastRequestedAt}`} className="bg-input-bg-light dark:bg-input-bg-dark border border-border-light dark:border-border-dark p-2 sm:p-3 rounded-lg flex justify-between items-center text-sm">
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{req.id}</p>
                                {req.artist && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{req.artist}</p>}
                            </div>
                            <div className="text-right text-text-secondary-light dark:text-text-secondary-dark flex-shrink-0 ml-2">
                                <p className="text-xs">{formatDate(req.lastRequestedAt)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-input-bg-light dark:bg-card-background-dark/50 rounded-lg border border-border-light dark:border-border-dark">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">まだリクエストはありません。</p>
                </div>
            )}
        </div>
    );
};

export const RequestRankingView: React.FC<RequestRankingViewProps> = ({ recentRequests, logRequest, refreshRankings }) => {
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3">
                <HeartIcon className="w-8 h-8 text-pink-500"/>
                曲のリクエスト
            </h2>
             <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-8 text-sm">
                リストにない曲はこちらからリクエストできます。
            </p>
            
            <RequestForm logRequest={logRequest} refreshRankings={refreshRankings} />

            <RecentRequestsList requests={recentRequests} />
        </div>
    );
};
import React, { useState } from 'react';
import { XIcon, ExternalLinkIcon, CheckCircleIcon, CloudUploadIcon } from '../../components/ui/Icons';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { containsNGWord } from '../../utils/validation';

interface RequestSongModalProps {
    isOpen: boolean;
    onClose: () => void;
    songTitle: string;
    logRequest: (term: string, artist: string, requester: string) => Promise<void>;
    onSuccess: () => void;
}

export const RequestSongModal: React.FC<RequestSongModalProps> = ({ isOpen, onClose, songTitle, logRequest, onSuccess }) => {
    const [casId, setCasId] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!casId.trim()) {
            alert('ツイキャスアカウント名を入力してください。');
            return;
        }
        if (containsNGWord(casId)) {
            alert('不適切な単語が含まれているため、送信できません。');
            return;
        }
        setIsSending(true);
        await logRequest(songTitle, '', casId);
        setIsSending(false);
        setIsSent(true);
        onSuccess();
        setTimeout(() => {
            onClose();
            // Reset state for next time
            setTimeout(() => setIsSent(false), 500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card-background-light dark:bg-card-background-dark rounded-lg shadow-2xl w-full max-w-md text-center p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark">
                    <XIcon className="w-6 h-6" />
                </button>
                
                {isSent ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px]">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4"/>
                        <h2 className="text-2xl font-bold mb-2">リクエスト完了</h2>
                        <p>リクエストを送信しました！</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">曲のリクエスト</h2>
                        <p className="mb-4">「<span className="font-bold" style={{color: 'var(--primary-color)'}}>{songTitle}</span>」</p>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div>
                                <label htmlFor="casId_modal" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">ツイキャスアカウント名 <span className="text-red-500">*</span></label>
                                <input
                                    id="casId_modal"
                                    type="text"
                                    value={casId}
                                    onChange={(e) => setCasId(e.target.value)}
                                    placeholder="IDかアカウント名を入力"
                                    required
                                    className="w-full bg-input-bg-light dark:bg-input-bg-dark border border-border-light dark:border-border-dark rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2"
                                    style={{'--tw-ring-color': 'var(--primary-color)'} as React.CSSProperties}
                                />
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">配信者のみに公開されます。</p>
                            </div>
                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark bg-input-bg-light dark:bg-card-background-dark/50 p-3 rounded-md space-y-1">
                                <p>※リクエストに必ずお応えできるわけではありません。</p>
                                <p>※<a href="https://www.print-gakufu.com/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{color: 'var(--primary-color)'}}>「ぷりんと楽譜」<ExternalLinkIcon className="inline-block w-3 h-3"/></a>にある曲は初見で弾ける可能性があります。</p>
                            </div>

                            <button type="submit" disabled={isSending} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed shadow">
                                {isSending ? <LoadingSpinner className="w-5 h-5"/> : <CloudUploadIcon className="w-5 h-5" />}
                                {isSending ? '送信中...' : 'この内容でリクエスト'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
import React, { useState } from 'react';
import { XIcon, ExternalLinkIcon, CheckCircleIcon, CloudUploadIcon } from '../../components/ui/Icons';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface RequestSongModalProps {
    isOpen: boolean;
    onClose: () => void;
    songTitle: string;
    logRequest: (term: string, requester: string) => Promise<void>;
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
        setIsSending(true);
        await logRequest(songTitle, casId);
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md text-center p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
                
                <CloudUploadIcon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h2 className="text-xl font-bold mb-2">「{songTitle}」をリクエスト</h2>
                <p className="text-sm text-gray-400 mb-6">今後の参考にさせていただきます！</p>

                {isSent ? (
                    <div className="text-center p-6 bg-gray-900 rounded-lg flex flex-col items-center gap-4">
                        <CheckCircleIcon className="w-12 h-12 text-green-400"/>
                        <p className="text-lg font-semibold">リクエストを送信しました！<br/>ありがとうございます！</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="casId_modal" className="block text-sm text-left font-medium text-gray-300 mb-1">
                                ツイキャスアカウント名 <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="casId_modal"
                                type="text"
                                value={casId}
                                onChange={(e) => setCasId(e.target.value)}
                                placeholder="@の後ろのIDを入力"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition"
                            />
                            <p className="text-xs text-gray-400 text-left mt-1">配信者のみに公開されます。</p>
                        </div>
                        
                        <div className="text-xs text-left text-gray-400 bg-gray-900 p-3 rounded-md space-y-2 mb-6">
                            <p>※リクエストに必ずお応えできるわけではありませんので、ご了承ください。</p>
                            <p>※<a href={`https://www.print-gakufu.com/search/result/keyword__${encodeURIComponent(songTitle)}/`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">「ぷりんと楽譜」<ExternalLinkIcon className="inline-block w-3 h-3"/></a>に楽譜がある曲は、初見での演奏が可能な場合があります。</p>
                        </div>

                        <button type="submit" disabled={isSending} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSending ? <LoadingSpinner className="w-5 h-5"/> : <CloudUploadIcon className="w-5 h-5" />}
                            {isSending ? '送信中...' : 'この内容でリクエスト'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
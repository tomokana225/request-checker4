import React from 'react';
import { BlogPost } from '../../types';
import { XIcon } from '../../components/ui/Icons';
import { SimpleMarkdownRenderer } from '../../components/ui/SimpleMarkdownRenderer';

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: BlogPost;
}

const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, post }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" 
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white truncate">{post.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto custom-scrollbar min-h-0">
                    {post.imageUrl && (
                        <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="w-full h-auto max-h-80 object-cover rounded-md mb-6" 
                        />
                    )}
                    <p className="text-sm text-gray-400 mb-4">{formatDate(post.createdAt)}</p>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        <SimpleMarkdownRenderer content={post.content} />
                    </div>
                </main>
            </div>
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import { BlogPost } from '../types';
import { SimpleMarkdownRenderer } from '../components/ui/SimpleMarkdownRenderer';
import { PostModal } from '../features/blog/PostModal';

interface BlogViewProps {
    posts: BlogPost[];
}

const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

type SortOrder = 'newest' | 'oldest';

export const BlogView: React.FC<BlogViewProps> = ({ posts }) => {
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) => {
            const dateA = a.createdAt || 0;
            const dateB = b.createdAt || 0;
            if (sortOrder === 'newest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });
    }, [posts, sortOrder]);
    
    const truncateContent = (content: string, maxLength: number) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    const SortButton: React.FC<{ order: SortOrder, label: string }> = ({ order, label }) => {
        const isActive = sortOrder === order;
        return (
            <button
                onClick={() => setSortOrder(order)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-cyan-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                style={{backgroundColor: isActive ? 'var(--primary-color)' : ''}}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2">お知らせ</h2>
            
            <div className="flex justify-center md:justify-end mb-6">
                <div className="flex items-center gap-2 p-1 bg-gray-700 rounded-lg">
                    <SortButton order="newest" label="新着順" />
                    <SortButton order="oldest" label="古い順" />
                </div>
            </div>

            {sortedPosts && sortedPosts.length > 0 ? (
                <div className="space-y-8">
                    {sortedPosts.map(post => (
                        <article 
                            key={post.id} 
                            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-[1.02] cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                        >
                            {post.imageUrl && (
                                <img 
                                    src={post.imageUrl} 
                                    alt={post.title} 
                                    className="w-full h-auto max-h-80 object-cover" 
                                />
                            )}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{post.title}</h3>
                                <p className="text-sm text-gray-400 mb-4">{formatDate(post.createdAt)}</p>
                                <SimpleMarkdownRenderer content={truncateContent(post.content, 120)} />
                                {post.content.length > 120 && (
                                     <p className="mt-4 font-semibold text-cyan-400 hover:text-cyan-300">続きを読む...</p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 mt-8">まだお知らせはありません。</p>
            )}

            {selectedPost && (
                <PostModal
                    isOpen={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                    post={selectedPost}
                />
            )}
        </div>
    );
};

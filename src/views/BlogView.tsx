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

const SegmentedControlButton: React.FC<{ onClick: () => void, isActive: boolean, children: React.ReactNode }> = ({ onClick, isActive, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'text-white' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}
            style={{backgroundColor: isActive ? 'var(--primary-color)' : ''}}
        >
            {children}
        </button>
    );
};

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

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2">お知らせ</h2>
            
            <div className="flex justify-center md:justify-end mb-6">
                <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-full">
                    <SegmentedControlButton onClick={() => setSortOrder('newest')} isActive={sortOrder === 'newest'}>新着順</SegmentedControlButton>
                    <SegmentedControlButton onClick={() => setSortOrder('oldest')} isActive={sortOrder === 'oldest'}>古い順</SegmentedControlButton>
                </div>
            </div>

            {sortedPosts && sortedPosts.length > 0 ? (
                <div className="space-y-8">
                    {sortedPosts.map(post => (
                        <article 
                            key={post.id} 
                            className="bg-input-bg-light dark:bg-input-bg-dark border border-border-light dark:border-border-dark rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-[1.02] cursor-pointer"
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
                                <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">{formatDate(post.createdAt)}</p>
                                <SimpleMarkdownRenderer content={truncateContent(post.content, 120)} />
                                {post.content.length > 120 && (
                                     <p className="mt-4 font-semibold" style={{color: 'var(--primary-color)'}}>続きを読む...</p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 bg-input-bg-light dark:bg-card-background-dark/50 rounded-lg border border-border-light dark:border-border-dark">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">まだお知らせはありません。</p>
                </div>
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
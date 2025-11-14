import React, { useState } from 'react';
import { Song, BlogPost, UiConfig, SetlistSuggestion, RequestRankingItem } from '../../types';
import { XIcon } from '../../components/ui/Icons';
import { SongListTab } from './SongListTab';
import { BlogTab } from './BlogTab';
import { SettingsTab } from './SettingsTab';
import { SetlistSuggestionsTab } from './SetlistSuggestionsTab';
import { RequestListTab } from './RequestListTab';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    songs: Song[];
    posts: BlogPost[];
    uiConfig: UiConfig;
    setlistSuggestions: SetlistSuggestion[];
    recentRequests: RequestRankingItem[];
    onSaveSongs: (newSongList: string) => Promise<boolean>;
    onSavePost: (post: Partial<BlogPost>) => Promise<boolean>;
    onDeletePost: (id: string, imageUrl?: string) => Promise<boolean>;
    onSaveUiConfig: (config: UiConfig) => Promise<boolean>;
}

type AdminTab = 'songs' | 'blog' | 'settings' | 'setlists' | 'requests';

export const AdminModal: React.FC<AdminModalProps> = (props) => {
    const { isOpen, onClose } = props;
    const [activeTab, setActiveTab] = useState<AdminTab>('songs');

    if (!isOpen) return null;

    const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-[var(--primary-color)] text-white' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card-background-light dark:bg-card-background-dark rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
                    <h2 className="text-xl font-bold">管理パネル</h2>
                    <button onClick={onClose} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"><XIcon className="w-6 h-6" /></button>
                </header>
                <div className="border-b border-border-light dark:border-border-dark p-2 flex-shrink-0 bg-background-light dark:bg-card-background-dark/50">
                    <nav className="flex items-center space-x-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg overflow-x-auto">
                        <TabButton tab="songs" label="曲リスト" />
                        <TabButton tab="blog" label="お知らせ" />
                        <TabButton tab="setlists" label="セトリ提案" />
                        <TabButton tab="requests" label="リクエスト" />
                        <TabButton tab="settings" label="アプリ設定" />
                    </nav>
                </div>
                <main className="flex-grow p-6 overflow-y-auto custom-scrollbar min-h-0 bg-background-light dark:bg-background-dark">
                    {activeTab === 'songs' && <SongListTab {...props} />}
                    {activeTab === 'blog' && <BlogTab {...props} />}
                    {activeTab === 'setlists' && <SetlistSuggestionsTab suggestions={props.setlistSuggestions} />}
                    {activeTab === 'requests' && <RequestListTab requests={props.recentRequests} />}
                    {activeTab === 'settings' && <SettingsTab {...props} />}
                </main>
            </div>
        </div>
    );
};
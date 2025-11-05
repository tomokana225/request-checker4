import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from './hooks/useApi';
// FIX: Import `UiConfig` to resolve 'Cannot find name' error.
import { Mode, UiConfig } from './types';

import { SearchView } from './views/SearchView';
import { ListView } from './views/ListView';
import { RankingView } from './views/RankingView';
import { RequestRankingView } from './views/RequestRankingView';
import { BlogView } from './views/BlogView';
import { SetlistSuggestionView } from './views/SetlistSuggestionView';
import { AdminModal } from './features/admin/AdminModal';
import { SuggestSongModal } from './features/suggest/SuggestSongModal';
import { SupportModal } from './features/support/SupportModal';

import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { NavButton } from './components/ui/NavButton';
import { 
    SearchIcon, 
    ListBulletIcon, 
    TrendingUpIcon, 
    HeartIcon,
    NewspaperIcon, 
    GiftIcon,
    VideoCameraIcon,
    QueueListIcon,
    SunIcon,
    MoonIcon,
} from './components/ui/Icons';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const { 
        songs, 
        songRankingList, 
        artistRankingList, 
        requestRankingList,
        posts,
        adminPosts,
        uiConfig,
        setlistSuggestions,
        isLoading, 
        error,
        rankingPeriod,
        setRankingPeriod,
        onSaveSongs,
        onSaveUiConfig,
        onSavePost,
        onDeletePost,
        logSearch,
        logRequest,
        saveSetlistSuggestion,
        refreshRankings,
    } = useApi();
    
    const [mode, setMode] = useState<Mode>('search');
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    useEffect(() => {
        if(uiConfig.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', uiConfig.primaryColor);
        }
        if(uiConfig.mainTitle) {
            document.title = uiConfig.mainTitle;
        }
    }, [uiConfig]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleAdminKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'a' && e.ctrlKey && e.altKey) {
            e.preventDefault();
            const password = prompt('Enter admin password:');
            // This is a simple, non-secure password check.
            if (password === 'admin') {
                setIsAdminModalOpen(true);
            } else if (password) {
                alert('Incorrect password.');
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleAdminKey);
        return () => window.removeEventListener('keydown', handleAdminKey);
    }, [handleAdminKey]);
    
    const handleSongSelectFromSuggest = (text: string) => {
        setMode('search');
        setSearchTerm(text);
        setIsSuggestModalOpen(false);
    };

    const renderView = () => {
        switch (mode) {
            case 'search':
                return <SearchView songs={songs} logSearch={logSearch} logRequest={logRequest} refreshRankings={refreshRankings} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setIsAdminModalOpen={setIsAdminModalOpen} />;
            case 'list':
                return <ListView songs={songs} />;
            case 'ranking':
                return <RankingView songRankingList={songRankingList} artistRankingList={artistRankingList} requestRankingList={requestRankingList} period={rankingPeriod} setPeriod={setRankingPeriod} />;
            case 'requests':
                return <RequestRankingView rankingList={requestRankingList} logRequest={logRequest} refreshRankings={refreshRankings} />;
            case 'blog':
                return <BlogView posts={posts} />;
            case 'setlist':
                return <SetlistSuggestionView songs={songs} onSave={saveSetlistSuggestion} onSuccessRedirect={() => setMode('search')} />;
            default:
                return <SearchView songs={songs} logSearch={logSearch} logRequest={logRequest} refreshRankings={refreshRankings} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setIsAdminModalOpen={setIsAdminModalOpen} />;
        }
    };
    
    const navButtonsConfig: { mode: Mode, icon: React.FC<{className?:string}>, config: keyof UiConfig['navButtons']}[] = [
        { mode: 'search', icon: SearchIcon, config: 'search' },
        { mode: 'list', icon: ListBulletIcon, config: 'list' },
        { mode: 'ranking', icon: TrendingUpIcon, config: 'ranking' },
        { mode: 'requests', icon: HeartIcon, config: 'requests' },
        { mode: 'blog', icon: NewspaperIcon, config: 'blog' },
        { mode: 'setlist', icon: QueueListIcon, config: 'setlist' },
    ];

    const backgroundStyle: React.CSSProperties = {
        backgroundColor: uiConfig.backgroundType === 'color' ? uiConfig.backgroundColor : 'transparent',
    };
    
    const hasSupportLinks = uiConfig.ofuseUrl || uiConfig.doneruUrl || uiConfig.amazonWishlistUrl;

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-[#111827] min-h-screen flex flex-col justify-center items-center text-gray-800 dark:text-white font-sans">
                <LoadingSpinner className="w-12 h-12 text-cyan-400" />
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">読み込み中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-[#111827] min-h-screen flex flex-col justify-center items-center text-gray-800 dark:text-white font-sans p-4">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">エラーが発生しました</h2>
                <p className="text-gray-600 dark:text-gray-300 text-center">データの読み込みに失敗しました。時間をおいてページを再読み込みしてください。</p>
                <p className="mt-2 text-xs text-gray-500 text-center">詳細: {error}</p>
            </div>
        );
    }

    return (
        <div style={backgroundStyle} className="bg-gray-100 dark:bg-transparent min-h-screen text-gray-800 dark:text-white font-sans transition-colors duration-500">
             {uiConfig.backgroundType === 'image' && uiConfig.backgroundImageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center -z-10"
                    style={{
                        backgroundImage: `url(${uiConfig.backgroundImageUrl})`,
                        opacity: uiConfig.backgroundOpacity,
                    }}
                />
            )}
             <div className="absolute inset-0 bg-black/50 -z-10" />

            <div className="container mx-auto px-4 py-8 relative z-0">
                 <div className="absolute top-4 right-4 z-10">
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-full bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300/70 dark:hover:bg-gray-700/70 transition-colors">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5 text-gray-800" /> : <SunIcon className="w-5 h-5 text-yellow-400" />}
                    </button>
                </div>
                <header className="text-center mb-8 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white" style={{ color: uiConfig.primaryColor }}>{uiConfig.mainTitle}</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{uiConfig.subtitle}</p>
                </header>

                <div className="max-w-5xl mx-auto flex justify-center flex-wrap gap-2 md:gap-4 mb-8">
                     {uiConfig.twitcastingUrl && (
                        <a href={uiConfig.twitcastingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md transition-transform transform hover:scale-105 font-semibold text-sm text-white">
                            <VideoCameraIcon className="w-4 h-4" /> 配信はこちら
                        </a>
                    )}
                    {uiConfig.navButtons.suggest.enabled && (
                        <button onClick={() => setIsSuggestModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg shadow-md transition-transform transform hover:scale-105 font-semibold text-sm text-white">
                            <GiftIcon className="w-4 h-4" /> {uiConfig.navButtons.suggest.label}
                        </button>
                    )}
                    {hasSupportLinks && (
                        <button onClick={() => setIsSupportModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg shadow-md transition-transform transform hover:scale-105 font-semibold text-sm text-white">
                            <HeartIcon className="w-4 h-4" /> サポート
                        </button>
                    )}
                </div>

                <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-5xl mx-auto mb-8">
                   {navButtonsConfig.filter(b => uiConfig.navButtons[b.config]?.enabled).map(button => (
                        <NavButton 
                            key={button.mode}
                            onClick={() => { setMode(button.mode); if (button.mode !== 'search') setSearchTerm(''); }}
                            isActive={mode === button.mode}
                            IconComponent={button.icon}
                            label={uiConfig.navButtons[button.config]?.label}
                        />
                   ))}
                </nav>

                <main>
                    {renderView()}
                </main>
            </div>
            
            <AdminModal 
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                songs={songs}
                posts={adminPosts}
                uiConfig={uiConfig}
                setlistSuggestions={setlistSuggestions}
                onSaveSongs={onSaveSongs}
                onSavePost={onSavePost}
                onDeletePost={onDeletePost}
                onSaveUiConfig={onSaveUiConfig}
            />
            <SuggestSongModal 
                isOpen={isSuggestModalOpen}
                onClose={() => setIsSuggestModalOpen(false)}
                songs={songs}
                onSelect={handleSongSelectFromSuggest}
            />
            <SupportModal 
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                uiConfig={uiConfig}
            />
        </div>
    );
};

export default App;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from './hooks/useApi';
import { Mode } from './types';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { SearchView } from './views/SearchView';
import { ListView } from './views/ListView';
import { RankingView } from './views/RankingView';
import { RequestRankingView } from './views/RequestRankingView';
import { BlogView } from './views/BlogView';
import { SetlistSuggestionView } from './views/SetlistSuggestionView';
import { NavButton } from './components/ui/NavButton';
import { AdminModal } from './features/admin/AdminModal';
import { SuggestSongModal } from './features/suggest/SuggestSongModal';
import { SupportModal } from './features/support/SupportModal';
import { 
    SearchIcon, MusicNoteIcon, ChartBarIcon, NewspaperIcon, 
    LightBulbIcon, MenuIcon, SunIcon, MoonIcon, 
    DocumentTextIcon, CloudUploadIcon, HeartIcon, XSocialIcon, TwitcasIcon,
    UserGroupIcon, ChevronLeftIcon, MenuAltIcon
} from './components/ui/Icons';


const App: React.FC = () => {
    const { 
        rawSongList, songs, songRankingList, artistRankingList, songLikeRankingList, posts, adminPosts, uiConfig, setlistSuggestions, recentRequests,
        isLoading, error, activeUserCount,
        rankingPeriod, setRankingPeriod,
        onSaveSongs, onSaveUiConfig, onSavePost, onDeletePost,
        logSearch, logRequest, logLike, saveSetlistSuggestion, refreshRankings
    } = useApi();
    
    const [mode, setMode] = useState<Mode>('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newIsDark = !prev;
            if (newIsDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            return newIsDark;
        });
    };
    
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', uiConfig.primaryColor);
        root.style.setProperty('--heading-font', uiConfig.headingFontFamily || "'Kiwi Maru', serif");
        root.style.setProperty('--body-font', uiConfig.bodyFontFamily || "'Noto Sans JP', sans-serif");
        root.style.setProperty('--heading-font-scale', String(uiConfig.headingFontScale || 1));
        root.style.setProperty('--body-font-scale', String(uiConfig.bodyFontScale || 1));

        if (uiConfig.backgroundType === 'color') {
            root.style.setProperty('--background-light', uiConfig.backgroundColor);
            root.style.setProperty('--background-dark', uiConfig.darkBackgroundColor);
        } else {
            root.style.setProperty('--background-light', '#f1f5f9');
            root.style.setProperty('--background-dark', '#020617');
        }
    }, [uiConfig]);

    const handleSuggestSelect = useCallback((text: string) => {
        setSearchTerm(text);
        setMode('search');
        setIsSuggestModalOpen(false);
    }, []);

    const handleSetlistSuccess = useCallback(() => {
        setMode('search');
    }, []);

    const handleAdminLogin = useCallback(() => {
        setIsAdminAuthenticated(true);
        setIsAdminModalOpen(true);
    }, []);

    const renderView = () => {
        if (isLoading && songs.length === 0) {
            return (
                <div className="flex flex-col justify-center items-center h-full">
                    <LoadingSpinner className="w-12 h-12" />
                    <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">読み込み中...</p>
                </div>
            );
        }

        switch (mode) {
            case 'search':
                return <SearchView songs={songs} logSearch={logSearch} logLike={logLike} logRequest={logRequest} refreshRankings={refreshRankings} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAdminLogin={handleAdminLogin} setMode={setMode} uiConfig={uiConfig} />;
            case 'list':
                return <ListView songs={songs} logLike={logLike} refreshRankings={refreshRankings} />;
            case 'ranking':
                return <RankingView songs={songs} songRanking={songRankingList} artistRanking={artistRankingList} songLikeRanking={songLikeRankingList} period={rankingPeriod} setPeriod={setRankingPeriod} />;
            case 'requests':
                return <RequestRankingView recentRequests={recentRequests} logRequest={logRequest} refreshRankings={refreshRankings} />;
            case 'news':
                return <BlogView posts={posts} />;
            case 'setlist':
                 return <SetlistSuggestionView songs={songs} onSave={saveSetlistSuggestion} onSuccessRedirect={handleSetlistSuccess}/>;
            default:
                return <SearchView songs={songs} logSearch={logSearch} logLike={logLike} logRequest={logRequest} refreshRankings={refreshRankings} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAdminLogin={handleAdminLogin} setMode={setMode} uiConfig={uiConfig} />;
        }
    };

    const navButtons = useMemo(() => {
        if (!uiConfig.navButtons) return [];
        const buttonConfigs = {
            search: { mode: 'search', icon: SearchIcon, config: uiConfig.navButtons.search },
            list: { mode: 'list', icon: MusicNoteIcon, config: uiConfig.navButtons.list },
            suggest: { mode: 'suggest', icon: LightBulbIcon, config: uiConfig.navButtons.suggest },
            news: { mode: 'news', icon: NewspaperIcon, config: uiConfig.navButtons.news },
            ranking: { mode: 'ranking', icon: ChartBarIcon, config: uiConfig.navButtons.ranking },
            requests: { mode: 'requests', icon: CloudUploadIcon, config: uiConfig.navButtons.requests },
            setlist: { mode: 'setlist', icon: MenuIcon, config: uiConfig.navButtons.setlist },
            printGakufu: { href: 'https://www.print-gakufu.com/search/result/score___subscription/', icon: DocumentTextIcon, config: uiConfig.navButtons.printGakufu },
        };
        const buttonOrder: (keyof typeof buttonConfigs)[] = ['search', 'list', 'suggest', 'news', 'ranking', 'requests', 'setlist', 'printGakufu'];
        return buttonOrder.map(key => buttonConfigs[key]).filter(btn => btn && btn.config?.enabled);
    }, [uiConfig.navButtons]);

    const backgroundStyle: React.CSSProperties =
        uiConfig.backgroundType === 'image' && uiConfig.backgroundImageUrl
            ? { backgroundImage: `url(${uiConfig.backgroundImageUrl})` }
            : {};
    
    if (isLoading && !rawSongList) {
        return (
            <div className="min-h-screen w-full flex flex-col justify-center items-center bg-background-light dark:bg-background-dark">
                <LoadingSpinner className="w-12 h-12" style={{color: 'var(--primary-color)'}}/>
                <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">読み込み中...</p>
            </div>
        );
    }

    const SidebarContent = () => (
        <>
            <div className={`flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark ${isSidebarOpen ? 'flex' : 'hidden md:flex'}`}>
                <h2 className={`font-bold text-lg whitespace-nowrap overflow-hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>メニュー</h2>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hidden md:block hover:bg-black/5 dark:hover:bg-white/10">
                    <MenuAltIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-grow p-2 space-y-1 overflow-y-auto custom-scrollbar">
                {navButtons.map((button) => {
                    if ('href' in button && button.href) {
                        return <NavButton key={button.href} href={button.href} onClick={() => {}} IconComponent={button.icon} label={button.config.label} isCollapsed={!isSidebarOpen} />;
                    }
                    if ('mode' in button) {
                        if (button.mode === 'suggest') {
                            return <NavButton key={button.mode} onClick={() => { setIsSuggestModalOpen(true); setIsMobileMenuOpen(false); }} isActive={false} IconComponent={button.icon} label={button.config.label} isCollapsed={!isSidebarOpen} />;
                        }
                        return <NavButton key={button.mode} onClick={() => { setMode(button.mode as Mode); setIsMobileMenuOpen(false); }} isActive={mode === button.mode} IconComponent={button.icon} label={button.config.label} isCollapsed={!isSidebarOpen} />;
                    }
                    return null;
                })}
            </nav>
            <div className={`p-2 border-t border-border-light dark:border-border-dark space-y-2 ${isSidebarOpen ? '' : 'hidden md:block'}`}>
                <div className={`${isSidebarOpen ? 'flex flex-col gap-2' : 'space-y-2'}`}>
                    {uiConfig.specialButtons?.twitcas?.enabled && uiConfig.twitcastingUrl && (
                        <a href={uiConfig.twitcastingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg text-white font-semibold transition-colors justify-center md:justify-start" style={{backgroundColor: 'var(--primary-color)'}}>
                            {uiConfig.twitcastingIconUrl ? <img src={uiConfig.twitcastingIconUrl} alt="TwitCasting" className="w-6 h-6 flex-shrink-0" /> : <TwitcasIcon className="w-6 h-6 flex-shrink-0"/>}
                            <span className={`${isSidebarOpen ? 'inline' : 'hidden'}`}>{uiConfig.specialButtons.twitcas.label}</span>
                        </a>
                    )}
                    {uiConfig.specialButtons?.x?.enabled && uiConfig.xUrl && (
                        <a href={uiConfig.xUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-black rounded-lg text-white font-semibold transition-colors justify-center md:justify-start">
                             {uiConfig.xIconUrl ? <img src={uiConfig.xIconUrl} alt="X" className="w-5 h-5 flex-shrink-0" /> : <XSocialIcon className="w-5 h-5 flex-shrink-0"/>}
                             <span className={`${isSidebarOpen ? 'inline' : 'hidden'}`}>{uiConfig.specialButtons.x.label}</span>
                        </a>
                    )}
                    {uiConfig.specialButtons?.support?.enabled && (
                        <button onClick={() => setIsSupportModalOpen(true)} className="flex items-center gap-3 p-3 bg-pink-500 hover:bg-pink-600 rounded-lg text-white font-semibold transition-colors justify-center md:justify-start w-full">
                            {uiConfig.supportIconUrl ? <img src={uiConfig.supportIconUrl} alt="Support" className="w-6 h-6 flex-shrink-0" /> : <HeartIcon className="w-6 h-6 flex-shrink-0" />}
                             <span className={`${isSidebarOpen ? 'inline' : 'hidden'}`}>{uiConfig.specialButtons.support.label}</span>
                        </button>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <>
            <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
                {/* Mobile Sidebar Overlay */}
                <div className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />

                {/* Sidebar */}
                <aside className={`fixed md:relative z-40 h-full bg-card-background-light dark:bg-card-background-dark border-r border-border-light dark:border-border-dark flex flex-col transition-all duration-300
                    ${isSidebarOpen ? 'w-64' : 'w-16'}
                    md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <SidebarContent />
                </aside>
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex-shrink-0 h-16 bg-card-background-light dark:bg-card-background-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2">
                            <MenuIcon className="w-6 h-6" />
                        </button>

                        <div className="absolute left-1/2 -translate-x-1/2 text-center">
                             <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">{uiConfig.mainTitle}</h1>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                           <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-2 sm:px-3 py-1.5 rounded-full" title="現在の訪問者数">
                                <UserGroupIcon className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
                                <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">{activeUserCount}</span>
                            </div>
                            <button onClick={toggleDarkMode} className="p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10" aria-label="Toggle dark mode">
                                {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                         {error && (
                            <div 
                                className="mb-4 bg-yellow-100 dark:bg-yellow-900/80 border border-yellow-500 text-yellow-800 dark:text-yellow-200 p-2 text-center text-sm z-20 shadow-md rounded-lg"
                                role="alert"
                            >
                                <strong>開発者向け情報:</strong> {error}
                            </div>
                        )}
                        
                        {uiConfig.backgroundType === 'image' && uiConfig.backgroundImageUrl && (
                            <div className="fixed inset-0 bg-cover bg-center bg-fixed z-[-1]" style={{ ...backgroundStyle, opacity: uiConfig.backgroundOpacity }} />
                        )}
                        <div className="fixed inset-0 z-[-2] bg-background-light dark:bg-background-dark" style={{ opacity: uiConfig.backgroundType === 'image' ? 1 - uiConfig.backgroundOpacity : 1 }}/>

                        {mode !== 'search' && (
                            <button
                                onClick={() => setMode('search')}
                                className="flex items-center gap-2 mb-6 text-sm font-semibold transition-opacity hover:opacity-75"
                                style={{ color: 'var(--primary-color)' }}
                                aria-label="検索画面に戻る"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                                <span>検索画面に戻る</span>
                            </button>
                        )}
                        {renderView()}
                    </main>
                </div>
            </div>

            {isAdminAuthenticated && (
                <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} songs={songs} posts={adminPosts} uiConfig={uiConfig} setlistSuggestions={setlistSuggestions} recentRequests={recentRequests} onSaveSongs={onSaveSongs} onSavePost={onSavePost} onDeletePost={onDeletePost} onSaveUiConfig={onSaveUiConfig} />
            )}
            <SuggestSongModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} songs={songs} onSelect={handleSuggestSelect} />
            <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} uiConfig={uiConfig} />
        </>
    );
};

export default App;

// This serverless function runs on Cloudflare, not in the user's browser.
// It acts as a secure intermediary to communicate with Firebase.
// This function has been extended to act as a router for multiple actions.

import { initializeApp, getApps } from 'firebase/app';
// Use the lite version of Firestore for performance in a serverless environment
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore/lite';

// Default song list to be used if Firestore is empty
const PLAYABLE_SONGS_EXAMPLE_STR = "夜に駆ける,YOASOBI,J-Pop,new\nPretender,Official髭男dism (オフィシャルヒゲダンディズム),J-Pop\nLemon,米津玄師,J-Pop\n紅蓮華,LiSA,Anime\nドライフラワー,優里,J-Pop\n白日,King Gnu (キングヌー),J-Rock\nマリーゴールド,あいみょん,J-Pop\n猫,DISH//,J-Rock\nうっせぇわ,Ado,J-Pop\n廻廻奇譚,Eve,Anime\n炎,LiSA,Anime\nCry Baby,Official髭男dism (オフィシャルヒゲダンディズム),Anime\nアイドル,YOASOBI,Anime,new\nKICK BACK,米津玄師,Anime\n新時代,Ado,Anime\n旅路,藤井風,J-Pop\n何なんw,藤井風,J-Pop\ngrace,藤井風,J-Pop\nきらり,藤井風,J-Pop\nSubtitle,Official髭男dism (オフィシャルヒゲダンディズム),J-Pop\n怪獣の花唄,Vaundy,J-Rock\nミックスナッツ,Official髭男dism (オフィシャルヒゲダンディズム),Anime\n水平線,back number,J-Pop\nシンデレラボーイ,Saucy Dog,J-Rock\nなんでもないや,RADWIMPS,Anime\nひまわりの約束,秦基博,J-Pop\nHANABI,Mr.Children,J-Pop\n天体観測,BUMP OF CHICKEN,J-Rock\n残酷な天使のテーゼ,高橋洋子,Anime\n千本桜,黒うさP,Vocaloid,,練習中";

const DEFAULT_UI_CONFIG = {
    mainTitle: 'ともかなのリクエスト曲ー検索',
    subtitle: '弾ける曲 or ぷりんと楽譜にある曲かチェックできます',
    primaryColor: '#ec4899',
    twitcastingUrl: 'https://twitcasting.tv/g:101738740616323847745',
    xUrl: '',
    ofuseUrl: '',
    doneruUrl: '',
    amazonWishlistUrl: '',
    backgroundType: 'image',
    backgroundColor: '#f3f4f6',
    darkBackgroundColor: '#111827',
    backgroundImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop',
    backgroundOpacity: 0.1,
    twitcastingIconUrl: '',
    xIconUrl: '',
    supportIconUrl: '',
    navButtons: {
        search: { label: '曲を検索', enabled: true },
        printGakufu: { label: 'ぷりんと楽譜', enabled: true },
        list: { label: '曲リスト', enabled: true },
        ranking: { label: 'ランキング', enabled: true },
        news: { label: 'お知らせ', enabled: true },
        requests: { label: 'リクエスト', enabled: true },
        suggest: { label:
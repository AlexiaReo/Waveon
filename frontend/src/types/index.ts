// src/types/index.ts

export interface Artist {
    id: number;
    name: string;
    followers: number;
}

export interface Playlist {
    id: number;
    title: string;
    imageUrl: string;
}

export interface Song {
    id: number;
    name: string;
    artist: Artist;
    filepath: string;
    imageUrl: string;
}

export type PageContentProps = {
    songs: Song[];
    filteredSongs: Song[];
    handleSongSelect: (song: Song) => void;
};
// src/types/index.ts

export interface Artist {
    id: number;
    name: string;
    followers: number;
}

export interface Song {
    id: number;
    name: string;
    artist: Artist;
    filepath: string;
    imageUrl: string;
}

export interface Playlist {
    id: number;
    title: string;
    imageUrl: string;
    description: string; // ADDED: Fixes the "Property description does not exist" error
    songs: Song[];       // ADDED: Required to list songs in the playlist page
}

export interface UserLibrary {
    playlists: Playlist[];
    followedArtists: Artist[];
}

export type PageContentProps = {
    songs: Song[];
    filteredSongs: Song[];
    handleSongSelect: (song: Song) => void;
};
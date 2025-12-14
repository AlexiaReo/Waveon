-- Seed playlist-song relations so the UI can render songs inside playlists.
-- Assumes ids from V7__data-for-songs.sql (1..4) and V8__data-for-playlist.sql (1..5).

INSERT INTO playlist_songs (playlist_id, song_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 3),
    (3, 2),
    (3, 4),
    (4, 4),
    (5, 3);


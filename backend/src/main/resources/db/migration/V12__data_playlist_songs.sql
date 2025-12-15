-- Link songs to playlists
-- Playlist 1: Top Hits 2024 (Songs 1, 2, 3)
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (1, 1);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (1, 2);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (1, 3);

-- Playlist 2: Chill Vibes (Songs 2, 4)
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (2, 2);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (2, 4);

-- Playlist 3: Workout Mix (Songs 1, 3)
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (3, 1);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (3, 3);

-- Playlist 4: Classic Rock (Song 4)
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (4, 4);

-- Playlist 5: My Favorites (Songs 1, 2, 4)
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (5, 1);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (5, 2);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (5, 4);
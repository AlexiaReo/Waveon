CREATE TABLE song_likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    liked_at TIMESTAMP,

    -- fk link to  existing tables
    CONSTRAINT fk_song_likes_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_song_likes_song FOREIGN KEY (song_id) REFERENCES songs (id),

    -- Unique constraint,so a user cant like the same song twice
    CONSTRAINT uk_user_song UNIQUE (user_id, song_id)
);
CREATE TABLE user_followed_artists (
    user_id BIGINT NOT NULL,
    artist_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, artist_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_artist FOREIGN KEY (artist_id) REFERENCES artists (id)
);
ALTER TABLE users
    ADD COLUMN email VARCHAR(255) UNIQUE,
    ADD COLUMN password VARCHAR(255);

UPDATE users SET email = 'ana@gmail.com', password = '1234admin' WHERE username = 'Ana';
UPDATE users SET email = 'maria@gmail.com', password = '1234admin' WHERE username = 'Maria';
UPDATE users SET email = 'elena@gmail.com', password = '1234admin' WHERE username = 'Elena';

ALTER TABLE users
    ALTER COLUMN email SET NOT NULL,
ALTER COLUMN password SET NOT NULL;

CREATE TABLE user_roles (
                            user_id BIGINT NOT NULL,
                            role VARCHAR(255),
                            CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id)
);

INSERT INTO user_roles (user_id, role)
SELECT id, 'USER' FROM users;
ALTER TABLE artists
    ADD COLUMN imageUrl VARCHAR(500);

UPDATE artists SET imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOwu2v67zRvQC3dZHrx1P3CgTbU-j5umuJaA&s' WHERE id = 1;  -- Rares
UPDATE artists SET imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/c/c7/BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg' WHERE id = 2;  -- Billie Eilish
UPDATE artists SET imageUrl = 'https://storage.googleapis.com/pr-newsroom-wp/1/2025/01/Bruno_Backyard_IG_Posted_SQUARE-1440x1440.jpeg' WHERE id = 3;  -- Bruno Mars
UPDATE artists SET imageUrl = 'https://people.com/thmb/iNq2lvidl1oetxbZf72QoZ4TW5k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(999x0:1001x2)/amy-winehouse-3-b69efdc175b6402082aa117b59dabc4e.jpg' WHERE id = 4;  -- Amy Winehouse
UPDATE artists SET imageUrl = 'https://ntvb.tmsimg.com/assets/assets/521029_v9_bc.jpg' WHERE id = 5;  -- Adele
UPDATE artists SET imageUrl = 'https://hips.hearstapps.com/hmg-prod/images/puerto-rican-singer-bad-bunny-attends-the-premiere-of-news-photo-1757619516.pjpeg' WHERE id = 6;  -- Bad Bunny
UPDATE artists SET imageUrl = 'https://hips.hearstapps.com/hmg-prod/images/elm030123btymuserihanna-001a-1675282361.jpg?resize=980:*' WHERE id = 7;  -- Rihanna
UPDATE artists SET imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Sam_Smith_Lollapalooza_2015-9_%28cropped%29.jpg/250px-Sam_Smith_Lollapalooza_2015-9_%28cropped%29.jpg' WHERE id = 8;  -- Sam Smith
UPDATE artists SET imageUrl = 'https://media.cnn.com/api/v1/images/stellar/prod/140619212053-pitbull-artist-rapper-6.jpg?q=w_1110,c_fill' WHERE id = 9;  -- Pitbull
UPDATE artists SET imageUrl = 'https://static.wikia.nocookie.net/taylor-swift/images/3/3f/The_Weeknd_1.jpg/revision/latest?cb=20250608131114' WHERE id = 10; -- The Weeknd
UPDATE artists SET imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/A%24AP_Rocky_at_the_2025_Cannes_Film_Festival_%28cropped%29.jpg/960px-A%24AP_Rocky_at_the_2025_Cannes_Film_Festival_%28cropped%29.jpg' WHERE id = 11; -- A$AP Rocky
UPDATE artists SET imageUrl = 'https://i.scdn.co/image/ab6761610000e5ebc210f6d6fd3915e96c2be72c' WHERE id = 12; -- Austin Farwell
UPDATE artists SET imageUrl = 'https://res.cloudinary.com/highereducation/image/upload/c_scale,w_750/f_auto,fl_lossy,q_auto:eco/v1532988563/TheBestColleges.org/images/study-active-recall.jpg' WHERE id = 13; -- Julian
UPDATE artists SET imageUrl = 'https://i.scdn.co/image/ab67616100005174fc7ab65cf4e57a0647c0e077' WHERE id = 14; -- Alej
UPDATE artists SET imageUrl = 'https://m.media-amazon.com/images/M/MV5BNjBlODMxYjQtODNiOC00NzlhLTkxMzYtZjMxYjYzMWM2YzVmXkEyXkFqcGc@._V1_.jpg' WHERE id = 15; -- Emile Mosseri
UPDATE artists SET imageUrl = 'https://cdn.jagonews24.com/media/imgAllNew/BG/2023March/justin-20250711123539.jpg' WHERE id = 16; -- Justin Bieber

ALTER TABLE artists ALTER COLUMN imageUrl SET NOT NULL;
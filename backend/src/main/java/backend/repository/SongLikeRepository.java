package backend.repository;

import backend.model.SongLike;
import backend.model.User;
import backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SongLikeRepository extends JpaRepository<SongLike, Long> {
    // Check if a specific user liked a specific song
    Optional<SongLike> findByUserAndSong(User user, Song song);

    // Get all songs liked by a user (for the "Liked Songs" playlist)
    List<SongLike> findByUserOrderByLikedAtDesc(User user);
}
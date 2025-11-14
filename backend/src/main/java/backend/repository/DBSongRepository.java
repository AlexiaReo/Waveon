package backend.repository;

import backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DBSongRepository extends JpaRepository<Song, Long> {
}

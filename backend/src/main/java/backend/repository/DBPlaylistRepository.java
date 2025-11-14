package backend.repository;

import backend.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DBPlaylistRepository extends JpaRepository<Playlist, Long> {
}

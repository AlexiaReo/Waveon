package backend.repository;

import backend.model.Playlist;
import backend.model.Privacy;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DBPlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByUser_Id(Long userId);

    List<Playlist> findByUser_IdAndVisibility(Long userId, Privacy visibility);

    @EntityGraph(attributePaths = "songs")
    Optional<Playlist> findWithSongsById(Long id);
}

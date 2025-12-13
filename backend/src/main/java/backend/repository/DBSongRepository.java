package backend.repository;

import backend.model.Genre;
import backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DBSongRepository extends JpaRepository<Song, Long> {

    List<Song> findByGenre(Genre genre);
}

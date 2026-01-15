package backend.repository;

import backend.model.Genre;
import backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DBSongRepository extends JpaRepository<Song, Long> {

    List<Song> findByGenre(Genre genre);

    // Used for Artist "My Songs" view
    List<Song> findByArtist_NameOrderByIdDesc(String artistName);

    // More strict variant if you want to query by id instead of name
    List<Song> findByArtist_IdOrderByIdDesc(Long artistId);
}

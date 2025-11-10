package backend.repository;

import backend.model.Artist;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class ArtistRepository {

    private final Map<Long, Artist> artists = new HashMap<>();

    private Long counter = 0L;

    public Artist save(Artist artist) {
        if (artist.getId() == null) {
            artist.setId(++counter);
        }
        artists.put(artist.getId(), artist);
        return artist;
    }

    public Optional<Artist> findById(Long id) {
        return Optional.ofNullable(artists.get(id));
    }

    public List<Artist> findAll() {
        return new ArrayList<>(artists.values());
    }

    public Artist update(Long id, Artist artist) {
        artist.setId(id);
        artists.put(id, artist);
        return artist;
    }

    public void deleteById(Long id) {
        artists.remove(id);
    }

    public boolean existsById(Long id) {
        return artists.containsKey(id);
    }


}

package backend.repository;

import backend.model.Album;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class AlbumRepository {

    private final Map<Long, Album> albums = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(1); // Start at 1


    public Album save(Album album) {
        if (album.getId() == null) {
            album.setId(counter.getAndIncrement());
        }
        albums.put(album.getId(), album);
        return album;
    }

    public Optional<Album> findById(Long id) {
        return Optional.ofNullable(albums.get(id));
    }

    public List<Album> findAll() {
        return new ArrayList<>(albums.values());
    }


    public Album update(Long id, Album album) {
        album.setId(id); // Ensure the ID is set for the update
        albums.put(id, album);
        return album;
    }

    public void deleteById(Long id) {
        albums.remove(id);
    }

    public boolean existsById(Long id) {
        return albums.containsKey(id);
    }

}
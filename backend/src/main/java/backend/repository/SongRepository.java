package backend.repository;

import backend.model.Song;
import backend.model.Genre;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class SongRepository {

    // am facut iar cu ConcurrentHashMap pt thread-safety
    private final ConcurrentHashMap<Long, Song> songs = new ConcurrentHashMap<>();
    private final AtomicLong nextId = new AtomicLong(1);

    public Song save(Song song) {
        if (song.getId() == null) {
            song.setId(nextId.getAndIncrement());
        }
        songs.put(song.getId(), song);
        return song;
    }

    public Collection<Song> findAll() {
        return songs.values();
    }

    public Song findById(Long id) {
        return songs.get(id);
    }

    public void deleteById(Long id) {
        songs.remove(id);
    }
}
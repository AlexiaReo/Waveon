package backend.repository;
import backend.model.Playlist;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class PlaylistRepository {
    private final Map<Long, Playlist> playlists = new ConcurrentHashMap<>(); //using HashMap crashes the app - thread safety
    private final AtomicLong idCounter = new AtomicLong(1); //using Long crashes the app - thread safety

    public Optional<Playlist> findById(long id) {
        return Optional.ofNullable(playlists.get(id));
    }

    //CRUD functionalities for Playlist
    public List<Playlist> findAll() {
        return new ArrayList<>(playlists.values());
    }

    public Playlist save(Playlist newPlaylist) {
        long newID = idCounter.getAndIncrement();
        newPlaylist.setId(newID);

        playlists.put(newID, newPlaylist);
        return newPlaylist;
    } //saves a new playlist after creating a newID and a newPlaylist

    public Playlist update(Playlist newPlaylist) {
        if (newPlaylist.getId() == null || !playlists.containsKey(newPlaylist.getId())) {
            throw new IllegalArgumentException("Playlist to update must have a valid ID.");
        }
        playlists.put(newPlaylist.getId(), newPlaylist);
        return newPlaylist;
    }

    public void deleteById(Long id) {
        playlists.remove(id);
    }


    public void deleteAll() {
        playlists.clear();
        idCounter.set(1);
    }




}

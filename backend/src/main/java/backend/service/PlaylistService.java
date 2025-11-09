package backend.service;

import backend.model.Playlist;
import backend.repository.PlaylistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;

    @Autowired
    public PlaylistService(PlaylistRepository playlistRepository) {
        this.playlistRepository = playlistRepository;
    }

    public Playlist createPlaylist(Playlist newPlaylist) {

        return playlistRepository.save(newPlaylist);
    }


    public List<Playlist> getAllPlaylists() {
        return playlistRepository.findAll();
    }


    public Playlist getPlaylistById(Long id) {
        return playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + id));
    }


    public Playlist updatePlaylist(Long id, Playlist updatedPlaylist) {

        Playlist existingPlaylist = getPlaylistById(id);

        updatedPlaylist.setId(id);

        return playlistRepository.update(updatedPlaylist);
    }

    public void deletePlaylist(Long id) {

        getPlaylistById(id);

        playlistRepository.deleteById(id);
    }
}
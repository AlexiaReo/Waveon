package backend.service;

import backend.model.Album;
import backend.repository.AlbumRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;

    public AlbumService(AlbumRepository albumRepository) {
        this.albumRepository = albumRepository;
    }

    /**
     * Creates a new album.
     */
    public Album createAlbum(Album album) {
        // Ensure ID is null so the repository can generate one
        album.setId(null);
        return albumRepository.save(album);
    }

    /**
     * Retrieves an album by its ID, or null if not found.
     */
    public Album getAlbumById(Long id) {
        return albumRepository.findById(id).orElse(null);
    }

    public List<Album> getAllAlbums() {
        return albumRepository.findAll();
    }

    /**
     * Updates an album. Returns null if the album does not exist.
     */
    public Album updateAlbum(Long id, Album album) {
        if (!albumRepository.existsById(id)) {
            return null; // Return null if not found
        }
        return albumRepository.update(id, album);
    }

    public void deleteAlbum(Long id) {
        albumRepository.deleteById(id);
    }
}
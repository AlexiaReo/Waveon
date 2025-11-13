package backend.controller;

import backend.model.Album;
import backend.service.AlbumService;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/albums")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
    }

    /**
     * CREATE Album
     * POST /albums
     */
    @PostMapping
    public ResponseEntity<Album> createAlbum(@Valid @RequestBody Album album) {
        Album newAlbum = albumService.createAlbum(album);
        return ResponseEntity.ok(newAlbum);
    }

    /**
     * READ Single Album by ID
     * GET /albums/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbumById(@PathVariable Long id) {
        Album album = albumService.getAlbumById(id);
        return album != null ? ResponseEntity.ok(album) : ResponseEntity.notFound().build();
    }

    /**
     * READ All Albums
     * GET /albums
     */
    @GetMapping
    public ResponseEntity<List<Album>> getAllAlbums() {
        List<Album> albums = albumService.getAllAlbums();
        return ResponseEntity.ok(albums);
    }

    /**
     * UPDATE Album
     * PUT /albums/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Album> updateAlbum(@PathVariable Long id, @Valid @RequestBody Album album) {
        Album updatedAlbum = albumService.updateAlbum(id, album);
        return updatedAlbum != null ? ResponseEntity.ok(updatedAlbum) : ResponseEntity.notFound().build();
    }

    /**
     * DELETE Album
     * DELETE /albums/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }
}
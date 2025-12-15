package backend.controller;

import backend.model.Album;
import backend.service.AlbumService;
import org.springframework.security.access.prepost.PreAuthorize; // ✅ ADDED
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/albums")
@CrossOrigin("*")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
    }

    /**
     * CREATE Album
     * POST /albums
     */
    @PreAuthorize("hasRole('ARTIST')")
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
    @PreAuthorize("hasRole('ARTIST')")
    @PutMapping("/{id}")
    public ResponseEntity<Album> updateAlbum(@PathVariable Long id, @Valid @RequestBody Album album) {
        Album updatedAlbum = albumService.updateAlbum(id, album);
        return updatedAlbum != null ? ResponseEntity.ok(updatedAlbum) : ResponseEntity.notFound().build();
    }

    /**
     * DELETE Album
     * DELETE /albums/{id}
     */
    @PreAuthorize("hasRole('ARTIST')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }
}

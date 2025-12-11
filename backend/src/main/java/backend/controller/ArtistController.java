package backend.controller;

import backend.dto.ArtistDTO;
import backend.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/artists")
@CrossOrigin("*")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @PostMapping
    public ResponseEntity<ArtistDTO> createArtist(@RequestBody ArtistDTO artistDto) {
        if (artistDto.name() == null || artistDto.name().isBlank()) {
            return ResponseEntity.badRequest().body(null);
        }
        ArtistDTO created = artistService.createArtist(artistDto);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{artistId}/follow")
    public ResponseEntity<Void> toggleFollow(@PathVariable Long artistId,
                                             @RequestParam Long userId) {
        artistService.toggleFollow(userId, artistId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/follow")
    public ResponseEntity<List<ArtistDTO>> getFollowedArtists(@RequestParam Long userId) {
        return ResponseEntity.ok(artistService.getFollowedArtists(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistDTO> getArtistById(@PathVariable Long id) {
        ArtistDTO dto = artistService.getArtistById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<ArtistDTO>> getAllArtists() {
        return ResponseEntity.ok(artistService.getAllArtists());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArtistDTO> updateArtist(@PathVariable Long id, @RequestBody ArtistDTO artistDto) {
        ArtistDTO updated = artistService.updateArtist(id, artistDto);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtist(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return ResponseEntity.noContent().build();
    }
}

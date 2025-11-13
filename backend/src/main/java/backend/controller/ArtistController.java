package backend.controller;

import backend.dto.ArtistDTO;
import backend.mapper.ArtistMapper;
import backend.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/artists")
public class ArtistController {

    private final ArtistService artistService;
    private final ArtistMapper artistMapper;

    public ArtistController(ArtistService artistService, ArtistMapper artistMapper) {
        this.artistService = artistService;
        this.artistMapper = artistMapper;
    }

    @PostMapping
    public ResponseEntity<ArtistDTO> createArtist(@RequestBody ArtistDTO artistDto) {
        ArtistDTO created = artistService.createArtist(artistDto);
        return ResponseEntity.ok(created);
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

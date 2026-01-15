package backend.controller;

import backend.dto.SongDTO;
import backend.service.SongLikeService;
import backend.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // ✅ ADDED
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/songs")
@CrossOrigin("*")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;
    private final SongLikeService songLikeService;

    @PostMapping("/{songId}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long songId,
                                           @RequestParam Long userId) {
        songLikeService.toggleLike(userId, songId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ARTIST')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongDTO> createSong(
            @RequestParam("name") String name,
            @RequestParam("artistName") String artistName,
            @RequestParam("genre") String genre,
            @RequestParam("imageUrl") String imageUrl,
            @RequestPart("file") MultipartFile file) {

        return ResponseEntity.ok(songService.createSong(name, artistName, genre, imageUrl, file));
    }

    @GetMapping
    public ResponseEntity<List<SongDTO>> getSongs(@RequestParam(required = false) String name) {
        List<SongDTO> songs;
        if (name != null && !name.trim().isEmpty()) {
            songs = songService.getSongsByName(name);
        } else {
            songs = songService.getAllSongs();
        }
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SongDTO> getSongById(@PathVariable Long id) {
        SongDTO song = songService.getSongById(id);
        if (song != null) {
            return ResponseEntity.ok(song);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PreAuthorize("hasRole('ARTIST')")
    @PutMapping("/{id}")
    public ResponseEntity<SongDTO> updateSong(
            @PathVariable Long id,
            @RequestBody SongDTO songDetails) {

        SongDTO updatedSong = songService.updateSong(id, songDetails);

        if (updatedSong != null) {
            return ResponseEntity.ok(updatedSong);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PreAuthorize("hasRole('ARTIST')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> streamSong(@PathVariable Long id) {
        SongDTO song = songService.getSongById(id);
        if (song == null || song.filepath() == null) return ResponseEntity.notFound().build();

        // 1. Check in manually added resources (src/main/resources/audio)
        Resource resource = new ClassPathResource("audio/" + song.filepath());

        // 2. If not found in resources, check in the external uploads folder
        if (!resource.exists()) {
            Path uploadPath = Paths.get("uploads/audio").toAbsolutePath().resolve(song.filepath());
            resource = new FileSystemResource(uploadPath);
        }

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(resource);
    }

    @GetMapping("/like")
    public ResponseEntity<List<SongDTO>> getLikedSongs(@RequestParam Long userId) {
        return ResponseEntity.ok(songLikeService.getLikedSongs(userId));
    }

    @GetMapping("/genre/{genreName}")
    public ResponseEntity<List<SongDTO>> getSongsByGenre(@PathVariable String genreName) {
        List<SongDTO> songs = songService.getSongsByGenre(genreName);
        return ResponseEntity.ok(songs);
    }

}

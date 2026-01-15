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
import org.springframework.security.core.Authentication;
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
            @RequestParam("genre") String genre,
            @RequestPart("image") MultipartFile image,
            Authentication authentication,
            @RequestPart("file") MultipartFile file) {

        return ResponseEntity.ok(songService.createSong(name, genre, image, file, authentication));
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

    // NOTE:
    // We intentionally require only authentication here and enforce ownership in the service.
    // In practice this endpoint is used only by Artists (frontend-gated), but some DBs contain
    // legacy role values that can cause `hasRole('ARTIST')` to wrongly 403.
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<List<SongDTO>> getMySongs(Authentication authentication) {
        return ResponseEntity.ok(songService.getMySongs(authentication));
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

    // Ownership is enforced in SongService.deleteSong(id, authentication)
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id, Authentication authentication) {
        songService.deleteSong(id, authentication);
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

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getSongImage(@PathVariable String filename) {
        Resource resource;

        // 1) Check classpath (optional)
        resource = new ClassPathResource("images/" + filename);

        // 2) Check uploads folder
        if (!resource.exists()) {
            Path uploadPath = Paths.get("uploads/images").toAbsolutePath().resolve(filename);
            resource = new FileSystemResource(uploadPath);
        }

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String detected = java.nio.file.Files.probeContentType(resource.getFile().toPath());
            if (detected != null) contentType = MediaType.parseMediaType(detected);
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok()
                .contentType(contentType)
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

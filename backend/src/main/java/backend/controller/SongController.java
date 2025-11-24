package backend.controller;

import backend.dto.SongDTO;
import backend.service.SongService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/songs")
@CrossOrigin("*")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    @PostMapping
    public ResponseEntity<SongDTO> createSong(@RequestBody SongDTO song) {
        return ResponseEntity.ok(songService.createSong(song));
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/songs/{id}/stream")
    public ResponseEntity<Resource> streamSong(@PathVariable Long id) {
        SongDTO song = songService.getSongById(id);

        if (song == null || song.filepath() == null) {
            return ResponseEntity.notFound().build();
        }

        Path path = Paths.get("audio/" + song.filepath());
        Resource resource = new FileSystemResource(path);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}

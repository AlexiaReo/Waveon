package backend.controller;

import backend.dto.SongDTO;
import backend.model.Song;
import backend.service.SongService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/songs")
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
}

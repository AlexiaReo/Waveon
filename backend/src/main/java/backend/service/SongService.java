package backend.service;

import backend.dto.SongDTO;
import backend.mapper.SongMapper;
import backend.model.Artist;
import backend.model.Genre;
import backend.model.Song;
import backend.repository.DBArtistRepository;
import backend.repository.DBSongRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SongService {

    private final DBSongRepository songRepository;
    private final SongMapper songMapper;
    private final DBArtistRepository artistRepository;

    public SongService(DBSongRepository songRepository, SongMapper songMapper, DBArtistRepository artistRepository) {

        this.songRepository = songRepository;
        this.songMapper = songMapper;
        this.artistRepository = artistRepository;
    }

// backend.service.SongService.java

    public SongDTO createSong(String name, String artistName, String genreName, String imageUrl, MultipartFile file) {
        // 1. Validate Artist exists by name
        Artist artist = artistRepository.findByName(artistName)
                .orElseThrow(() -> new RuntimeException("Artist not found with name: " + artistName));

        // 2. Save the file to your resources folder
        String fileName = saveFile(file);

        // 3. Map Genre
        Genre genre;
        try {
            genre = Genre.valueOf(genreName.toUpperCase());
        } catch (IllegalArgumentException e) {
            genre = Genre.OTHER; // Fallback
        }

        // 4. Build Entity
        Song song = new Song();
        song.setName(name);
        song.setArtist(artist);
        song.setGenre(genre);
        song.setImageUrl(imageUrl);
        song.setFilepath(fileName);

        Song saved = songRepository.save(song);
        return songMapper.toDTO(saved);
    }

    private String saveFile(MultipartFile file) {
        try {
            // 1. Define the directory path
            // Using Paths.get("").toAbsolutePath() ensures we start from the project root
            Path uploadDir = Paths.get("uploads/audio").toAbsolutePath();

            // 2. Create the directory if it doesn't exist
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("Created directory: " + uploadDir);
            }

            // 3. Generate unique filename
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path targetPath = uploadDir.resolve(fileName);

            // 4. Copy the file
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException e) {
            // Log the actual error for debugging
            e.printStackTrace();
            throw new RuntimeException("Could not save audio file: " + e.getMessage());
        }
    }


    public SongDTO getSongById(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));
        return songMapper.toDTO(song);
    }

    public List<SongDTO> getAllSongs() {
        return songRepository.findAll()
                .stream()
                .map(songMapper::toDTO)
                .collect(Collectors.toList());
    }


    public SongDTO updateSong(Long id, SongDTO dto) {
        Song existing = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));

        existing.setName(dto.name());
        existing.setGenre(dto.genre());

        if (!existing.getArtist().getId().equals(dto.artist().id())) {
            Artist artist = artistRepository.findById(dto.artist().id())
                    .orElseThrow(() -> new RuntimeException("Artist not found with id: " + dto.artist().id()));
            existing.setArtist(artist);
        }

        Song saved = songRepository.save(existing);
        return songMapper.toDTO(saved);
    }

    public void deleteSong(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));
        songRepository.deleteById(id);
    }

    public List<SongDTO> getSongsByName(String name) {
        return songRepository.findAll()
                .stream()
                .filter(song -> song.getName() != null && song.getName().toLowerCase().contains(name.toLowerCase()))
                .map(songMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<SongDTO> getSongsByGenre(String genreName) {
        try {

            Genre genre = Genre.valueOf(genreName.toUpperCase());

            List<Song> songs = songRepository.findByGenre(genre);

            return songs.stream()
                    .map(songMapper::toDTO)
                    .collect(Collectors.toList());

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid genre: " + genreName);
        }
    }
}
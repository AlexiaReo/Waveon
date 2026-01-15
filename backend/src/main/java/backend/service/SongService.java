package backend.service;

import backend.dto.SongDTO;
import backend.mapper.SongMapper;
import backend.model.Artist;
import backend.model.Genre;
import backend.model.Song;
import backend.repository.DBArtistRepository;
import backend.repository.DBSongRepository;
import backend.repository.DBUserRepository;
import backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class SongService {

    /**
     * Public base URL for this backend (scheme + host). Used to generate absolute URLs.
     *
     * Examples:
     * - Local: http://localhost:8081
     * - Cloud Run: https://waveon-backend-xxxxx-ew.a.run.app
     */
    @Value("${PUBLIC_BASE_URL:http://localhost:8081}")
    private String publicBaseUrl;

    private final DBSongRepository songRepository;
    private final SongMapper songMapper;
    private final DBArtistRepository artistRepository;
    private final DBUserRepository userRepository;

    public SongService(DBSongRepository songRepository, SongMapper songMapper, DBArtistRepository artistRepository, DBUserRepository userRepository) {

        this.songRepository = songRepository;
        this.songMapper = songMapper;
        this.artistRepository = artistRepository;
        this.userRepository = userRepository;
    }

// backend.service.SongService.java

    public SongDTO createSong(String name,
                               String genreName,
                               MultipartFile image,
                               MultipartFile file,
                               Authentication authentication,
                               Long artistId) {
        // 1. Authenticate user
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request");
        }

        String authenticatedEmail = authentication.getName();
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new RuntimeException("User not found for authenticated email: " + authenticatedEmail));

        Artist artist;
        if (artistId != null) {
            // Use the specified artist
            artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new RuntimeException("Artist not found with id: " + artistId));
        } else {
            // Use the authenticated user's artist
            String artistName = user.getUsername();
            artist = artistRepository.findByName(artistName)
                    .orElseGet(() -> artistRepository.save(Artist.builder()
                            .name(artistName)
                            .followers(0L)
                            .build()));
        }

        // 3. Save the audio + image files
        String audioFileName = saveAudioFile(file);
        String imageFileName = saveImageFile(image);

        // IMPORTANT: return an absolute URL the frontend can load from anywhere.
        String base = (publicBaseUrl == null) ? "" : publicBaseUrl.trim();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        String imageUrl = base + "/api/songs/image/" + imageFileName;

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
        song.setFilepath(audioFileName);

        Song saved = songRepository.save(song);
        return songMapper.toDTO(saved);
    }

    private String saveAudioFile(MultipartFile file) {
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

    private String saveImageFile(MultipartFile file) {
        try {
            Path uploadDir = Paths.get("uploads/images").toAbsolutePath();

            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("Created directory: " + uploadDir);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path targetPath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Could not save image file: " + e.getMessage());
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

    public List<SongDTO> getMySongs(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request");
        }

        String authenticatedEmail = authentication.getName();
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new RuntimeException("User not found for authenticated email: " + authenticatedEmail));

        String artistName = user.getUsername();
        return songRepository.findByArtist_NameOrderByIdDesc(artistName)
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

    public void deleteSong(Long id, Authentication authentication) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));

        // Only allow an artist to delete their own songs.
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request");
        }

        String authenticatedEmail = authentication.getName();
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new RuntimeException("User not found for authenticated email: " + authenticatedEmail));

        String artistName = user.getUsername();
        if (song.getArtist() == null || !Objects.equals(song.getArtist().getName(), artistName)) {
            throw new RuntimeException("Forbidden: you can only delete your own songs");
        }

        // Best-effort file cleanup (ignore failures)
        deleteAudioFileIfUploaded(song.getFilepath());
        deleteImageFileIfUploaded(song.getImageUrl());

        songRepository.deleteById(id);
    }

    private void deleteAudioFileIfUploaded(String filepath) {
        if (filepath == null || filepath.isBlank()) return;
        try {
            Path uploadPath = Paths.get("uploads/audio").toAbsolutePath().resolve(filepath);
            if (Files.exists(uploadPath)) {
                Files.delete(uploadPath);
            }
        } catch (Exception ignored) {
        }
    }

    private void deleteImageFileIfUploaded(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        // We only delete uploaded images which are stored via our own endpoint.
        // Example: http://localhost:8081/api/songs/image/<filename>
        final String marker = "/api/songs/image/";
        int idx = imageUrl.indexOf(marker);
        if (idx < 0) return;

        String filename = imageUrl.substring(idx + marker.length());
        if (filename.isBlank()) return;

        try {
            Path uploadPath = Paths.get("uploads/images").toAbsolutePath().resolve(filename);
            if (Files.exists(uploadPath)) {
                Files.delete(uploadPath);
            }
        } catch (Exception ignored) {
        }
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

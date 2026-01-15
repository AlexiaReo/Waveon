package backend.service;

import backend.dto.SongDTO;
import backend.mapper.SongMapper;
import backend.model.Artist;
import backend.model.Genre;
import backend.model.Song;
import backend.model.User;
import backend.repository.DBArtistRepository;
import backend.repository.DBSongRepository;
import backend.repository.DBUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

    @Value("${PUBLIC_BASE_URL:http://localhost:8081}")
    private String publicBaseUrl;

    private final DBSongRepository songRepository;
    private final SongMapper songMapper;
    private final DBArtistRepository artistRepository;
    private final DBUserRepository userRepository;

    @Autowired(required = false)
    private GoogleCloudStorageService googleCloudStorageService;

    public SongService(DBSongRepository songRepository, SongMapper songMapper, DBArtistRepository artistRepository, DBUserRepository userRepository) {
        this.songRepository = songRepository;
        this.songMapper = songMapper;
        this.artistRepository = artistRepository;
        this.userRepository = userRepository;
    }

    public SongDTO createSong(String name, String genreName, MultipartFile image, MultipartFile file, Authentication authentication, Long artistId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated request");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Artist artist;
        if (artistId != null) {
            artist = artistRepository.findById(artistId).orElseThrow();
        } else {
            String artistName = user.getUsername();
            artist = artistRepository.findByName(artistName)
                    .orElseGet(() -> artistRepository.save(Artist.builder().name(artistName).followers(0L).build()));
        }

        String audioFileName = saveAudioFile(file);
        String imageUrl = "";

        if (image != null && !image.isEmpty()) {
            try {
                if (googleCloudStorageService != null) {
                    imageUrl = googleCloudStorageService.uploadImage(image);
                } else {
                    imageUrl = "/api/songs/image/" + saveImageFileLocally(image);
                }
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed", e);
            }
        }

        if (artist.getImageUrl() == null || artist.getImageUrl().isEmpty()) {
            artist.setImageUrl(imageUrl);
            artistRepository.save(artist);
        }

        Song song = new Song();
        song.setName(name);
        song.setArtist(artist);
        try {
            song.setGenre(Genre.valueOf(genreName.toUpperCase()));
        } catch (Exception e) {
            song.setGenre(Genre.OTHER);
        }
        song.setImageUrl(imageUrl);
        song.setFilepath(audioFileName);

        return songMapper.toDTO(songRepository.save(song));
    }

    private String saveAudioFile(MultipartFile file) {
        try {
            Path path = Paths.get("uploads/audio").toAbsolutePath();
            if (!Files.exists(path)) Files.createDirectories(path);
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), path.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) { throw new RuntimeException(e); }
    }

    private String saveImageFileLocally(MultipartFile file) throws IOException {
        Path path = Paths.get("uploads/images").toAbsolutePath();
        if (!Files.exists(path)) Files.createDirectories(path);
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), path.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    public List<SongDTO> getAllSongs() {
        return songRepository.findAll().stream().map(songMapper::toDTO).collect(Collectors.toList());
    }
}
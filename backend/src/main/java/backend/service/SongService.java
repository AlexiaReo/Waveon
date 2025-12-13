package backend.service;

import backend.dto.SongDTO;
import backend.mapper.SongMapper;
import backend.model.Artist;
import backend.model.Genre;
import backend.model.Song;
import backend.repository.DBArtistRepository;
import backend.repository.DBSongRepository;
import org.springframework.stereotype.Service;

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

    public SongDTO createSong(SongDTO dto) {
        Song song = songMapper.toEntity(dto);

        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("Song name is required");
        }
        Artist artist = artistRepository.findById(dto.artist().id())
                .orElseThrow(() -> new RuntimeException("Artist not found with id: " + dto.artist().id()));
        song.setArtist(artist);
        song.setName(dto.name());
        song.setGenre(dto.genre());
        Song saved = songRepository.save(song);

        return songMapper.toDTO(saved);
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
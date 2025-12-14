package backend.service;

import backend.dto.PlaylistDTO;
import backend.dto.SongDTO;
import backend.mapper.PlaylistMapper;
import backend.mapper.SongMapper;
import backend.model.Playlist;
import backend.model.Song;
import backend.model.User;
import backend.repository.DBPlaylistRepository;
import backend.repository.DBSongRepository;
import backend.repository.DBUserRepository;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    private final DBPlaylistRepository playlistRepository;
    private final PlaylistMapper playlistMapper;
    private final DBUserRepository userRepository;
    private final DBSongRepository songRepository;
    private final SongMapper songMapper;

    public PlaylistService(DBPlaylistRepository playlistRepository,
                           PlaylistMapper playlistMapper,
                           DBUserRepository userRepository,
                           DBSongRepository songRepository,
                           SongMapper songMapper) {
        this.playlistRepository = playlistRepository;
        this.playlistMapper = playlistMapper;
        this.userRepository = userRepository;
        this.songRepository = songRepository;
        this.songMapper = songMapper;
    }

    public PlaylistDTO createPlaylist(PlaylistDTO dto) {
        Playlist playlist = playlistMapper.toEntity(dto);
        if (dto.user_id() == null) {
            throw new IllegalArgumentException("user_id cannot be null");
        }
        User user = userRepository.findById(dto.user_id().id())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.user_id()));
        playlist.setUser(user);

        if (dto.songs() != null && !dto.songs().isEmpty()) {
            List<Long> songIds = dto.songs().stream()
                    .map(SongDTO::id)
                    .collect(Collectors.toList());
            List<Song> persistentSongs = songRepository.findAllById(songIds);
            playlist.getSongs().clear();
            playlist.getSongs().addAll(persistentSongs);
        }

        Playlist saved = playlistRepository.save(playlist);
        return playlistMapper.toDto(saved);
    }

    public List<PlaylistDTO> getAllPlaylists() {
        return playlistRepository.findAll()
                .stream()
                .map(playlistMapper::toDto)
                .collect(Collectors.toList());
    }

    public PlaylistDTO getPlaylistById(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + id));
        return playlistMapper.toDto(playlist);
    }

    public PlaylistDTO updatePlaylist(Long id, PlaylistDTO dto) {
        Playlist existing = playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + id));

        existing.setTitle(dto.title());
        existing.setDescription(dto.description());
        existing.setVisibility(dto.visibility());

        // Update User if changed
        if (dto.user_id() != null && !existing.getUser().getId().equals(dto.user_id().id())) {
            User user = userRepository.findById(dto.user_id().id())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.user_id()));
            existing.setUser(user);
        }

        // ADDED: Update Songs List
        if (dto.songs() != null) {
            // Extract IDs from the DTO list
            List<Long> songIds = dto.songs().stream()
                    .map(SongDTO::id)
                    .collect(Collectors.toList());

            // Fetch the actual Song entities
            List<Song> newSongs = songRepository.findAllById(songIds);

            // Clear and replace
            existing.getSongs().clear();
            existing.getSongs().addAll(newSongs);
        }

        Playlist saved = playlistRepository.save(existing);
        return playlistMapper.toDto(saved);
    }

    public void deletePlaylist(Long id) {
        playlistRepository.deleteById(id);
    }

    public PlaylistDTO addSongToPlaylist(Long playlistId, Long songId) {

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + playlistId));

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + songId));


        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
            Playlist saved = playlistRepository.save(playlist);
            return playlistMapper.toDto(saved);
        } else {
            return playlistMapper.toDto(playlist);
        }
    }

    @Transactional(readOnly = true)
    public List<SongDTO> getPlaylistSongs(Long playlistId) {
        Playlist playlist = playlistRepository.findWithSongsById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + playlistId));

        return playlist.getSongs().stream()
                .map(songMapper::toDTO)
                .toList();
    }
}

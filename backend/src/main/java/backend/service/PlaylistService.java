package backend.service;

import backend.dto.PlaylistDTO;
import backend.mapper.PlaylistMapper;
import backend.model.Playlist;
import backend.repository.PlaylistRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistMapper playlistMapper;

    public PlaylistService(PlaylistRepository playlistRepository, PlaylistMapper playlistMapper) {
        this.playlistRepository = playlistRepository;
        this.playlistMapper = playlistMapper;
    }

    public PlaylistDTO createPlaylist(PlaylistDTO dto) {
        Playlist playlist = playlistMapper.toEntity(dto);
        return playlistMapper.toDto(playlistRepository.save(playlist));
    }

    public List<PlaylistDTO> getAllPlaylists() {
        return playlistRepository.findAll().stream()
                .map(playlistMapper::toDto)
                .collect(Collectors.toList());
    }

    public PlaylistDTO getPlaylistById(Long id) {
        return playlistRepository.findById(id)
                .map(playlistMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + id));
    }

    public PlaylistDTO updatePlaylist(Long id, PlaylistDTO dto) {
        Playlist updated = playlistMapper.toEntity(dto);
        updated.setId(id);
        return playlistMapper.toDto(playlistRepository.save(updated));
    }

    public void deletePlaylist(Long id) {
        playlistRepository.deleteById(id);
    }
}

package backend.service;

import backend.dto.PlaylistDTO;
import backend.mapper.PlaylistMapper;
import backend.model.Playlist;
import backend.repository.PlaylistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistMapper playlistMapper;

    @Autowired
    public PlaylistService(PlaylistRepository playlistRepository, PlaylistMapper playlistMapper) {
        this.playlistRepository = playlistRepository;
        this.playlistMapper = playlistMapper;
    }
    public PlaylistDTO createPlaylist(PlaylistDTO dto) {
        Playlist playlist = playlistMapper.toEntity(dto);
        Playlist saved = playlistRepository.save(playlist);
        return playlistMapper.toDTO(saved);
    }


    public List<PlaylistDTO> getAllPlaylists() {
        return playlistRepository.findAll()
                .stream()
                .map(playlistMapper::toDTO)
                .collect(Collectors.toList());
    }

    public PlaylistDTO getPlaylistById(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + id));
        return playlistMapper.toDTO(playlist);
    }


    public PlaylistDTO updatePlaylist(Long id, PlaylistDTO dto) {
        Playlist existing = playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + id));

        // Map DTO → Entity and preserve existing ID
        Playlist updated = playlistMapper.toEntity(dto);
        updated.setId(existing.getId());

        Playlist saved = playlistRepository.update(updated);
        return playlistMapper.toDTO(saved);
    }

    public void deletePlaylist(Long id) {
        Playlist existing = playlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Playlist not found with id: " + id));
        playlistRepository.deleteById(existing.getId());
    }
}
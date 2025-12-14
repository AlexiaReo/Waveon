package backend.service;

import backend.dto.PlaylistDTO;
import backend.dto.UserProfileDTO;
import backend.mapper.PlaylistMapper;
import backend.mapper.UserMapper;
import backend.model.Playlist;
import backend.model.Privacy;
import backend.model.User;
import backend.repository.DBPlaylistRepository;
import backend.repository.DBUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProfileService {

    private final DBUserRepository userRepository;
    private final DBPlaylistRepository playlistRepository;
    private final UserMapper userMapper;
    private final PlaylistMapper playlistMapper;

    public ProfileService(DBUserRepository userRepository,
                          DBPlaylistRepository playlistRepository,
                          UserMapper userMapper,
                          PlaylistMapper playlistMapper) {
        this.userRepository = userRepository;
        this.playlistRepository = playlistRepository;
        this.userMapper = userMapper;
        this.playlistMapper = playlistMapper;
    }

    public UserProfileDTO getProfile(Long userId, Long viewerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));

        boolean isOwner = viewerId != null && viewerId.equals(userId);

        List<Playlist> playlists = isOwner
                ? playlistRepository.findByUser_Id(userId)
                : playlistRepository.findByUser_IdAndVisibility(userId, Privacy.PUBLIC);

        List<PlaylistDTO> playlistDTOs = playlists.stream()
                .map(playlistMapper::toDto)
                .toList();

        return new UserProfileDTO(userMapper.toDto(user), isOwner, playlistDTOs);
    }
}


package backend.service;

import backend.dto.ArtistDTO;
import backend.dto.PlaylistDTO;
import backend.dto.UserDTO;
import backend.dto.UserLibraryDTO;
import backend.mapper.ArtistMapper;
import backend.mapper.PlaylistMapper;
import backend.mapper.UserMapper;
import backend.model.User;
import backend.repository.DBUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final DBUserRepository userRepository;
    private final UserMapper userMapper;
    private final PlaylistMapper playlistMapper;
    private final ArtistMapper artistMapper;

    public UserService(DBUserRepository userRepository, UserMapper userMapper, PlaylistMapper playlistMapper, ArtistMapper artistMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.playlistMapper = playlistMapper;
        this.artistMapper = artistMapper;
    }

    public UserDTO createUser(UserDTO dto) {
        if (dto.username() == null || dto.username().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        User user = userMapper.toEntity(dto);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public UserDTO getUser(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDto)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    public UserLibraryDTO getUserLibrary(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        List<PlaylistDTO> playlists = user.getPlaylists().stream()
                .map(playlistMapper::toDto)
                .collect(Collectors.toList());

        List<ArtistDTO> followedArtists = user.getFollowedArtists().stream()
                .map(artistMapper::toDto)
                .collect(Collectors.toList());

        return new UserLibraryDTO(playlists, followedArtists);
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existing.setUsername(dto.username());

        User saved = userRepository.save(existing);
        return userMapper.toDto(saved);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
package backend.service;

import backend.dto.UserDTO;
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

    public UserService(DBUserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
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

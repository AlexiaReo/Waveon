package backend.service;

import backend.dto.UserDTO;
import backend.mapper.UserMapper;
import backend.model.User;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public UserDTO createUser(UserDTO dto) {
        User user = userMapper.toEntity(dto);
        return userMapper.toDto(userRepository.save(user));
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
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("User not found");
        }
        User updated = userMapper.toEntity(dto);
        updated.setId(id);
        return userMapper.toDto(userRepository.save(updated));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

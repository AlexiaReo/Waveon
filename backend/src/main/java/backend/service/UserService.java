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
        User saved = userRepository.save(user);
        return userMapper.toDTO(saved);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        return userMapper.toDTO(user);
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("User not found");
        }

        User updated = userMapper.toEntity(dto);
        updated.setId(id);

        User saved = userRepository.save(updated);
        return userMapper.toDTO(saved);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("User not found");
        }
        userRepository.deleteById(id);
    }
}

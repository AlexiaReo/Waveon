package backend.service;

import backend.model.User;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    public User updateUser(Long id, User updated) {
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("User not found");
        }
        updated.setId(id);
        return userRepository.save(updated);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

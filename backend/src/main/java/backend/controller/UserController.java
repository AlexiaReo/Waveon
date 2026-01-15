package backend.controller;

import backend.dto.AuthResponse;
import backend.dto.UserDTO;
import backend.dto.UserLibraryDTO;
import backend.dto.UserProfileDTO;
import backend.model.User;
import backend.repository.DBUserRepository;
import backend.service.ProfileService;
import backend.service.CustomUserDetails;
import backend.service.JwtService;
import backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;
    private final ProfileService profileService;
    private final DBUserRepository userRepository;
    private final JwtService jwtService;

    @Autowired
    public UserController(UserService userService, ProfileService profileService, DBUserRepository userRepository, JwtService jwtService) {
        this.userService = userService;
        this.profileService = profileService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO dto) {
        if (dto.username() == null || dto.username().isBlank()) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(userService.createUser(dto));
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @GetMapping("/{id}/library")
    public ResponseEntity<UserLibraryDTO> getUserLibrary(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserLibrary(id));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerId
    ) {
        return ResponseEntity.ok(profileService.getProfile(id, viewerId));
    }

    @PostMapping("/{id}/become-artist")
    public ResponseEntity<AuthResponse> becomeArtist(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // JWT subject is the email (see JwtService + CustomUserDetails)
        String authenticatedEmail = authentication.getName();
        if (authenticatedEmail == null || !authenticatedEmail.equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Replace roles with ROLE_ARTIST only (as requested)
        user.getRoles().clear();
        user.getRoles().add("ROLE_ARTIST");
        User saved = userRepository.save(user);

        String token = jwtService.generateToken(new CustomUserDetails(saved));
        return ResponseEntity.ok(new AuthResponse(token, saved.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}

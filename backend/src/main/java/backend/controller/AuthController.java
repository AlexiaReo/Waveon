package backend.controller;

import backend.dto.AuthRequest;
import backend.dto.AuthResponse;
import backend.model.User;
import backend.repository.DBUserRepository;
import backend.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final DBUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          DBUserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody AuthRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.email(),
                                request.password()
                        )
                );


        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken((UserDetails) authentication.getPrincipal());

        return ResponseEntity.ok(new AuthResponse(token, user.getId()));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @RequestBody AuthRequest request) {

        String role = request.role();

        if (!"USER".equals(role) && !"ARTIST".equals(role)) {
            return ResponseEntity.badRequest().build();
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .username(request.username())
                .roles(Set.of("ROLE_" + role))
                .build();

        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}

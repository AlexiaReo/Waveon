package backend.service;

import backend.model.User;
import backend.repository.DBUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final DBUserRepository userRepository;

    public CustomUserDetailsService(DBUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * IMPORTANT:
     * Spring Security still calls this method loadUserByUsername(),
     * but we treat the parameter as EMAIL.
     */
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email));

        return new CustomUserDetails(user);
    }
}
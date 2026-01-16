package backend.service;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        // Debug log to diagnose unexpected 401/403s (e.g., artist-only endpoints).
        // Safe: do NOT log the token itself.
        if ("/songs".equals(request.getRequestURI()) || "/api/songs".equals(request.getRequestURI())) {
            log.info("Auth debug: {} {} hasAuthorizationHeader={} existingAuth={}",
                    request.getMethod(),
                    request.getRequestURI(),
                    header != null && header.startsWith("Bearer "),
                    SecurityContextHolder.getContext().getAuthentication() != null);
        }

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String email;
            try {
                email = jwtService.extractEmail(token);
            } catch (Exception e) {
                log.warn("JWT extractEmail failed for {} {}: {}", request.getMethod(), request.getRequestURI(), e.toString());
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if ("/songs".equals(request.getRequestURI()) || "/api/songs".equals(request.getRequestURI())) {
                    log.info("Auth debug: resolved user email={} authorities={}",
                            email,
                            userDetails.getAuthorities().stream().map(Object::toString).toList());
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }
}

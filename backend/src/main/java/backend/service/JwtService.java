package backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtService {

    private static final String SECRET =
            "change-this-secret-key-to-at-least-32-characters-long";
    private static final long EXPIRATION = 1000 * 60 * 60; // 1 hour

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername()) // email
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey())   // ✅ now valid
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getKey()) // ✅ now valid
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
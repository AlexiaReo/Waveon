package backend.repository;

import backend.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DBArtistRepository extends JpaRepository<Artist, Long> {
    Optional<Artist> findByName(String name);
}

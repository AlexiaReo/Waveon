package backend.repository;

import backend.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DBArtistRepository extends JpaRepository<Artist, Long> {
}

package backend.model;

import jakarta.persistence.*;
import lombok.*; // Import all lombok stuff
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "song_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "song_id"})
})
@Getter // Replaces @Data part 1
@Setter // Replaces @Data part 2
@NoArgsConstructor // Replaces @Data part 3
public class SongLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Stop the infinite loop
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Stop the infinite loop
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @CreationTimestamp
    private LocalDateTime likedAt;
}
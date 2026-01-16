package backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "artists")
@Getter
@Setter // Moved to class level to reduce clutter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "serial")
    private Long id;

    @Column(nullable = false)
    private String name;

    private Long followers;

    @Column(name = "imageurl") // Kept origin/main version for DB compatibility
    private String imageUrl;

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Song> songs = new ArrayList<>();

    @ManyToMany(mappedBy = "followedArtists", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private Set<User> userFollowers = new HashSet<>();
}
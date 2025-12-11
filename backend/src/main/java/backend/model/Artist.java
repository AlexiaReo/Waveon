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
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "serial")
    private Long id;

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    private Long followers;

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Song> songs = new ArrayList<>();

    @ManyToMany(mappedBy = "followedArtists", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private Set<User> userFollowers = new HashSet<>();
}

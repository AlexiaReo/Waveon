package backend.model;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "playlists")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "serial")
    private Long id;

    @Setter
    @Column(nullable = false)
    private String title;

    @Setter
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Setter
    private String description;

    @Enumerated(EnumType.STRING)
    @Setter
    private Privacy visibility;

    @Column(name = "imageurl", nullable = false)
    @Setter
    private String imageUrl;

    @ManyToMany
    @JoinTable(
            name = "playlist_songs", //db
            joinColumns = @JoinColumn(name = "playlist_id"),
            inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    private List<Song> songs = new ArrayList<>();
}



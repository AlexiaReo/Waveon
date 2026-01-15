package backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


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

    @Setter
    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Song> songs = new ArrayList<>();

    @ManyToMany(mappedBy = "followedArtists", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private Set<User> userFollowers = new HashSet<>();
}

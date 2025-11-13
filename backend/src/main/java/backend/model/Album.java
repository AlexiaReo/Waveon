package backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class Album {

    private Long id;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotNull(message = "artistId cannot be null")
    private Long artistId;

    @NotBlank(message = "Release date cannot be blank")
    private String releaseDate;

    public Album(Long id, String title, Long artistId, String releaseDate) {
        this.id = id;
        this.title = title;
        this.artistId = artistId;
        this.releaseDate = releaseDate;
    }

    // --- Getters ---

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Long getArtistId() {
        return artistId;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    // --- Setters ---

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setArtistId(Long artistId) {
        this.artistId = artistId;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }
}
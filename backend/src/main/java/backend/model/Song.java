package backend.model;

public class Song {
    private Long id;
    private String name;
    private Long artistId; // Association to an artist
    private Genre genre;

    // constructor
    public Song(Long id, String name, Long artistId, Genre genre) {
        this.id = id;
        this.name = name;
        this.artistId = artistId;
        this.genre = genre;
    }

    // getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getArtistId() {
        return artistId;
    }

    public void setArtistId(Long artistId) {
        this.artistId = artistId;
    }

    public Genre getGenre() {
        return genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }
}
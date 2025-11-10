package backend.model;

public class Artist {

    private Long id;
    private String name;
    private Long followers;

    public Artist(Long id, String name, Long followers) {
        this.id = id;
        this.name = name;
        this.followers = followers;
    }

    public Long getId() {
        return id;
    }

    public Long getFollowers() {
        return followers;
    }

    public String getName() {
        return name;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setFollowers(Long followers) {
        this.followers = followers;
    }
}

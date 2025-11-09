package backend.model;

public class Playlist {
    private Long id;
    private String title;
    private Long userID;
    private String description;
    private Privacy visibility;

    //constructor
    public Playlist(Long id, String title, Long userID, String description, Privacy visibility) {
        this.id = id;
        this.title = title;
        this.userID = userID;
        this.description = description;
        this.visibility = visibility;

    }

    //getters for playlist
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Long getUserID() {
        return userID;
    }

    public String getDescription() {
        return description;
    }

    public Privacy getVisibility() {
        return visibility;
    }

    //setters for playlist
    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setVisibility(Privacy visibility) {
        this.visibility = visibility;
    }


}



package backend.dto;

import backend.model.Privacy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class PlaylistDTO {
    private Long id;
    private String title;
    private Long userID;
    private String description;
    private Privacy visibility;

}
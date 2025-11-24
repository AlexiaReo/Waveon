package backend.mapper;

import backend.dto.ArtistDTO;
import backend.dto.SongDTO;
import backend.model.Artist;
import backend.model.Song;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SongMapper {
    @Mapping(source = "artist", target = "artist")
    SongDTO toDTO(Song song);

   @Mapping(source = "artist", target = "artist")
    Song toEntity(SongDTO dto);

    ArtistDTO toDTO(Artist artist);
    Artist toEntity(ArtistDTO dto);
}

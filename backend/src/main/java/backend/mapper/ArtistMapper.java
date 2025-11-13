package backend.mapper;

import org.mapstruct.Mapper;
import backend.model.Artist;
import backend.dto.ArtistDTO;

@Mapper(componentModel = "spring")
public interface ArtistMapper {
    ArtistDTO toDto(Artist artist);
    Artist toEntity(ArtistDTO dto);
}
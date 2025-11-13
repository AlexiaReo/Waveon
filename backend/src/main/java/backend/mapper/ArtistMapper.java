package backend.mapper;

import backend.dto.ArtistDTO;
import backend.model.Artist;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ArtistMapper{
    // Entity → DTO
    ArtistDTO toDTO(Artist artist);

    // DTO → Entity
    Artist toEntity(ArtistDTO dto);
}
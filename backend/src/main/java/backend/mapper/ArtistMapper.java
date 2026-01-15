package backend.mapper;

import org.mapstruct.Mapper;
import backend.model.Artist;
import backend.dto.ArtistDTO;

@Mapper(componentModel = "spring")
public interface ArtistMapper {
    default ArtistDTO toDto(Artist artist) {
        if (artist == null) return null;
        return new ArtistDTO(artist.getId(), artist.getName(), artist.getFollowers(), artist.getImageUrl());
    }

    default Artist toEntity(ArtistDTO dto) {
        if (dto == null) return null;
        Artist artist = new Artist();
        artist.setName(dto.name());
        artist.setFollowers(dto.followers());
        artist.setImageUrl(dto.imageUrl());
        return artist;
    }
}
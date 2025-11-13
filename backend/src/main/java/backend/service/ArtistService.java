package backend.service;

import backend.dto.ArtistDTO;
import backend.mapper.ArtistMapper;
import backend.model.Artist;
import backend.repository.ArtistRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final ArtistMapper artistMapper;

    public ArtistService(ArtistRepository artistRepository, ArtistMapper artistMapper) {
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
    }

    public ArtistDTO createArtist(ArtistDTO artistDto) {
        Artist artist = artistMapper.toEntity(artistDto);
        Artist saved = artistRepository.save(artist);
        return artistMapper.toDto(saved);
    }

    public ArtistDTO getArtistById(Long id) {
        return artistRepository.findById(id)
                .map(artistMapper::toDto)
                .orElse(null);
    }

    public List<ArtistDTO> getAllArtists() {
        return artistRepository.findAll()
                .stream()
                .map(artistMapper::toDto)
                .collect(Collectors.toList());
    }

    public ArtistDTO updateArtist(Long id, ArtistDTO dto) {
        Artist existing = artistRepository.findById(id).orElse(null);
        if (existing == null) return null;
        Artist updated = artistMapper.toEntity(dto);
        updated.setId(id);
        return artistMapper.toDto(artistRepository.save(updated));
    }

    public void deleteArtist(Long id) {
        artistRepository.deleteById(id);
    }
}

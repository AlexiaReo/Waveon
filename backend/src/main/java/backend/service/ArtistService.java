package backend.service;

import backend.dto.ArtistDTO;
import backend.mapper.ArtistMapper;
import backend.model.Artist;
import backend.repository.DBArtistRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArtistService {

    private final DBArtistRepository artistRepository;
    private final ArtistMapper artistMapper;

    public ArtistService(DBArtistRepository artistRepository, ArtistMapper artistMapper) {
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
    }

    public ArtistDTO createArtist(ArtistDTO artistDto) {
        Artist artist = artistMapper.toEntity(artistDto);
        Artist saved = artistRepository.save(artist);
        return artistMapper.toDto(saved);
    }

    public ArtistDTO getArtistById(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found"));
        return artistMapper.toDto(artist);
    }

    public List<ArtistDTO> getAllArtists() {
        return artistRepository.findAll()
                .stream()
                .map(artistMapper::toDto)
                .collect(Collectors.toList());
    }

    public ArtistDTO updateArtist(Long id, ArtistDTO dto) {
        Artist existing = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found with id: " + id));
        existing.setName(dto.name());
        existing.setFollowers(dto.followers());

        Artist saved = artistRepository.save(existing);
        return artistMapper.toDto(saved);
    }

    public void deleteArtist(Long id) {
        artistRepository.deleteById(id);
    }
}

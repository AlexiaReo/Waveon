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
    public ArtistDTO createArtist(ArtistDTO dto) {
        Artist artist = artistMapper.toEntity(dto);     // Map DTO → Entity
        Artist saved = artistRepository.save(artist);   // Save entity
        return artistMapper.toDTO(saved);               // Map back Entity → DTO
    }

    public ArtistDTO getArtistById(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found with id: " + id));
        return artistMapper.toDTO(artist);
    }

    public List<ArtistDTO> getAllArtists() {
        return artistRepository.findAll()
                .stream()
                .map(artistMapper::toDTO)
                .collect(Collectors.toList());
    }
    public ArtistDTO updateArtist(Long id, ArtistDTO dto) {
        if (!artistRepository.existsById(id)) {
            throw new RuntimeException("Artist not found with id: " + id);
        }

        Artist artist = artistMapper.toEntity(dto);
        Artist updated = artistRepository.update(id, artist);
        return artistMapper.toDTO(updated);
    }


    public void deleteArtist(Long id) {
        if (!artistRepository.existsById(id)) {
            throw new RuntimeException("Artist not found with id: " + id);
        }
        artistRepository.deleteById(id);
    }
}

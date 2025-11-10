package backend.service;

import backend.model.Artist;
import backend.repository.ArtistRepository;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class ArtistService {

    private final ArtistRepository artistRepository;
    public ArtistService(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    public void createArtist(Long id, String name, Long followers) {
        Artist artist = new Artist(id, name, followers);
        artistRepository.save(artist);
    }

    public Artist getArtistById(Long id) {
        return artistRepository.findById(id).orElse(null);
    }

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    public Artist updateArtist(Long id, Artist artist) {
        return artistRepository.update(id, artist);
    }

    public void deleteArtist(Long id) {
        artistRepository.deleteById(id);
    }

}

package backend.service;

import backend.dto.ArtistDTO;
import backend.mapper.ArtistMapper;
import backend.model.Artist;
import backend.model.User;
import backend.repository.DBArtistRepository;
import backend.repository.DBUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArtistService {

    private final DBArtistRepository artistRepository;
    private final DBUserRepository userRepository;
    private final ArtistMapper artistMapper;

    public ArtistService(DBArtistRepository artistRepository,
                         DBUserRepository userRepository,
                         ArtistMapper artistMapper) {
        this.artistRepository = artistRepository;
        this.userRepository = userRepository;
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

    @Transactional
    public void toggleFollow(Long userId, Long artistId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new RuntimeException("Artist not found"));

        if (user.getFollowedArtists().contains(artist)) {
            user.getFollowedArtists().remove(artist); // Unfollow
        } else {
            user.getFollowedArtists().add(artist);    // Follow
        }

        //increase the number of followers in the artist table
        long currentCount = artist.getFollowers() == null ? 0 : artist.getFollowers();
        if (user.getFollowedArtists().contains(artist)) {
            artist.setFollowers(currentCount + 1);
        } else {
            artist.setFollowers(Math.max(0, currentCount - 1)); // Prevent negative numbers
        }

        // save both
        userRepository.save(user);
        artistRepository.save(artist);
    }

    @Transactional(readOnly = true)
    public List<ArtistDTO> getFollowedArtists(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getFollowedArtists().stream()
                .map(artistMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ArtistDTO> getTopArtists(int limit) {

        List<Artist> allArtists = artistRepository.findAll();


        return allArtists.stream()
                // descending order by followers
                .sorted((a1, a2) -> {
                    int followers1 = a1.getUserFollowers() != null ? a1.getUserFollowers().size() : 0;
                    int followers2 = a2.getUserFollowers() != null ? a2.getUserFollowers().size() : 0;
                    return Integer.compare(followers2, followers1);
                })
                // take the first n
                .limit(limit)
                .map(artistMapper::toDto)
                .collect(Collectors.toList());
    }
}

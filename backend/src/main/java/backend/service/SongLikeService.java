package backend.service;

import backend.model.Song;
import backend.model.SongLike;
import backend.model.User;
import backend.repository.SongLikeRepository;
import backend.repository.DBSongRepository;
import backend.repository.DBUserRepository;
import backend.dto.SongDTO;
import backend.mapper.SongMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SongLikeService {

    private final SongLikeRepository songLikeRepository;
    private final DBSongRepository songRepository;
    private final DBUserRepository userRepository;
    private final SongMapper songMapper;
    @Transactional
    public boolean toggleLike(Long userId, Long songId) {
        // fetch User and Song, error if not found
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found with ID: " + songId));

        // check if the like exists
        Optional<SongLike> existingLike = songLikeRepository.findByUserAndSong(user, song);

        if (existingLike.isPresent()) {
            // UNLIKE: remove
            songLikeRepository.delete(existingLike.get());
            return false; // Return false to indicate "Not Liked"
        } else {
            // LIKE: add it
            SongLike newLike = new SongLike();
            newLike.setUser(user);
            newLike.setSong(song);
            songLikeRepository.save(newLike);
            return true; // Return true to indicate "Liked"
        }
    }
    public List<SongDTO> getLikedSongs(Long userId) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //  Get the likes from the repo
        List<SongLike> likes = songLikeRepository.findByUserOrderByLikedAtDesc(user);

        //  Convert List<SongLike> -> List<SongDTO>
        return likes.stream()
                .map(like -> like.getSong())      // Extract the Song entity
                .map(songMapper::toDTO)           // Convert to DTO (Check if your mapper uses toDto or toDTO)
                .toList();
    }
}
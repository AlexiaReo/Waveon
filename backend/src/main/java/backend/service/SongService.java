package backend.service;

import backend.model.Song;
import backend.repository.SongRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Collection;

@Service
public class SongService {

    private final SongRepository songRepository;

    public SongService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    public Song createSong(Song song) {

        song.setId(null);
        return songRepository.save(song);
    }


    public Song getSongById(Long id) {
        if (songRepository.findById(id) == null) {
            return null;
        }
        return songRepository.findById(id);
    }

    public List<Song> getAllSongs() {

        Collection<Song> songCollection = songRepository.findAll();
        List<Song> songList = new ArrayList<>(songCollection);

        return songList;
    }

    public Song updateSong(Long id, Song updatedSong) {
        Song existingSong = songRepository.findById(id);
        if (existingSong != null) {

            existingSong.setName(updatedSong.getName());
            existingSong.setArtistId(updatedSong.getArtistId());

            if (updatedSong.getGenre() != null) {
                existingSong.setGenre(updatedSong.getGenre());
            }

            updatedSong.setId(id);
            return songRepository.save(updatedSong);
        }
        return null;
    }

    public boolean deleteSong(Long id) {
        if (songRepository.findById(id) != null) {
            songRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
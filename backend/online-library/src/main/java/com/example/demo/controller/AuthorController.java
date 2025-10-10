package com.example.demo.controller;

import com.example.demo.model.Author;
import com.example.demo.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthorController {

    @Autowired
    private AuthorRepository authorRepo;

    // ✅ Get all authors
    @GetMapping
    public List<Author> getAllAuthors() {
        return authorRepo.findAll();
    }

    // ✅ Add new author (ADMIN only)
    @PostMapping
    public ResponseEntity<?> addAuthor(@RequestBody Author author) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not logged in"));
        }

        // Set createdBy
        author.setCreatedBy(auth.getName());
        Author saved = authorRepo.save(author);
        return ResponseEntity.ok(Map.of(
                "message", "Author added successfully",
                "author", saved
        ));
    }

    // ✅ Edit author (ADMIN only)
    @PutMapping("/{id}")
    public ResponseEntity<?> editAuthor(@PathVariable Long id, @RequestBody Author updated) {
        Author existing = authorRepo.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Author not found"));
        }
        existing.setName(updated.getName());
        existing.setBio(updated.getBio());
        authorRepo.save(existing);
        return ResponseEntity.ok(Map.of(
                "message", "Author updated successfully",
                "author", existing
        ));
    }

    // ✅ Delete author (ADMIN only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAuthor(@PathVariable Long id) {
        Author existing = authorRepo.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Author not found"));
        }
        authorRepo.delete(existing);
        return ResponseEntity.ok(Map.of("message", "Author deleted successfully"));
    }
}

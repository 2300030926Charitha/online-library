package com.example.demo.controller;

import com.example.demo.model.Book;
import com.example.demo.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:5173") // allow frontend React app
public class BookController {

    private final BookRepository repo;

    public BookController(BookRepository repo) {
        this.repo = repo;
    }

    // ✅ Fetch all books
    @GetMapping
    public List<Book> getAllBooks() {
        return repo.findAll();
    }

    // ✅ Add a new book
    @PostMapping
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        Book savedBook = repo.save(book); // saves to MySQL
        return ResponseEntity.ok().body(
                Map.of(
                        "message", "✅ Book added successfully!",
                        "book", savedBook
                )
        );
    }

    // ✅ Delete book by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Book not found with id: " + id)
            );
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "🗑️ Book deleted successfully!"));
    }
}

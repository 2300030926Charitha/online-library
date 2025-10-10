package com.example.demo.controller;

import com.example.demo.model.Book;
import com.example.demo.model.User;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:5173")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/";

    // ✅ GET all books
    @GetMapping
    public ResponseEntity<?> getAllBooks() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not logged in"));
            }

            List<Book> books = bookRepository.findAll();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch books"));
        }
    }

    // ✅ Upload a book
    @PostMapping("/upload")
    public ResponseEntity<?> uploadBook(
            @RequestParam String title,
            @RequestParam int year,
            @RequestParam MultipartFile file
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not logged in"));
            }

            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();

            if (!user.getRole().equalsIgnoreCase("AUTHOR") && 
                !user.getRole().equalsIgnoreCase("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only authors or admins can upload books"));
            }

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.write(filePath, file.getBytes());

            Book book = new Book();
            book.setTitle(title);
            book.setAuthor(user.getUsername());
            book.setYear(year);
            book.setFileName(filename);
            book.setFilePath(filePath.toString());

            bookRepository.save(book);

            return ResponseEntity.ok(Map.of(
                    "message", "Book uploaded successfully",
                    "bookId", book.getId()
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save file"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    // ✅ Update a book
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam int year,
            @RequestParam(required = false) MultipartFile file
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not logged in"));
            }

            Optional<Book> bookOpt = bookRepository.findById(id);
            if (bookOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Book not found"));

            Book book = bookOpt.get();

            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found"));

            User user = userOpt.get();

            if (!user.getRole().equalsIgnoreCase("ADMIN") &&
                !book.getAuthor().equals(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You cannot edit this book"));
            }

            book.setTitle(title);
            book.setYear(year);

            if (file != null) {
                String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.write(filePath, file.getBytes());
                book.setFileName(filename);
                book.setFilePath(filePath.toString());
            }

            bookRepository.save(book);

            return ResponseEntity.ok(Map.of(
                    "message", "Book updated successfully",
                    "bookId", book.getId()
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save file"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    // ✅ Delete a book
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not logged in"));
            }

            Optional<Book> bookOpt = bookRepository.findById(id);
            if (bookOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Book not found"));

            Book book = bookOpt.get();

            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found"));

            User user = userOpt.get();

            if (!user.getRole().equalsIgnoreCase("ADMIN") &&
                !book.getAuthor().equals(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You cannot delete this book"));
            }

            // Delete file from disk
            Path path = Paths.get(book.getFilePath());
            Files.deleteIfExists(path);

            bookRepository.delete(book);

            return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete book"));
        }
    }

    // ✅ Download a book
    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadBook(@PathVariable Long id) {
        try {
            Optional<Book> bookOpt = bookRepository.findById(id);
            if (bookOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Book not found"));

            Book book = bookOpt.get();
            Path path = Paths.get(book.getFilePath());
            if (!Files.exists(path)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "File not found"));
            }

            byte[] data = Files.readAllBytes(path);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(
                    ContentDisposition.builder("attachment")
                            .filename(book.getFileName())
                            .build()
            );

            return new ResponseEntity<>(data, headers, HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to download file"));
        }
    }
}

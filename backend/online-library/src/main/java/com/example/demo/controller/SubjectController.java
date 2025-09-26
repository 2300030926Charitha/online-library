package com.example.demo.controller;

import com.example.demo.model.Subject;
import com.example.demo.repository.SubjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "http://localhost:5173") // allow React frontend
public class SubjectController {

    private final SubjectRepository repo;

    public SubjectController(SubjectRepository repo) {
        this.repo = repo;
    }

    // ✅ Get all subjects
    @GetMapping
    public List<Subject> getAllSubjects() {
        return repo.findAll();
    }

    // ✅ Add new subject
    @PostMapping
    public ResponseEntity<?> addSubject(@RequestBody Subject subject) {
        Subject savedSubject = repo.save(subject);
        return ResponseEntity.ok(
            Map.of(
                "message", "✅ Subject added successfully",
                "subject", savedSubject
            )
        );
    }

    // ✅ Delete subject
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "❌ Subject not found"));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "🗑️ Subject deleted successfully"));
    }
}

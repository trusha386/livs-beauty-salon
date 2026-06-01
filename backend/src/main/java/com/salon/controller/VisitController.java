package com.salon.controller;

import com.salon.dto.VisitRequest;
import com.salon.model.Visit;
import com.salon.repository.VisitRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    @Autowired
    private VisitRepository visitRepository;

    @GetMapping
    public ResponseEntity<List<Visit>> getAllVisits() {
        List<Visit> visits = visitRepository.findAll();
        return ResponseEntity.ok(visits);
    }

    @PostMapping
    public ResponseEntity<Visit> createVisit(@Valid @RequestBody VisitRequest visitRequest) {
        Visit visit = new Visit();
        visit.setCustomerName(visitRequest.getCustomerName());
        
        if (visitRequest.getVisitDate() != null) {
            visit.setVisitDate(visitRequest.getVisitDate());
        } else {
            visit.setVisitDate(Instant.now());
        }
        
        visit.setStaffUsername(visitRequest.getStaffUsername());
        visit.setStaffDisplayName(visitRequest.getStaffDisplayName());
        
        // Auto-calculates/forces 10% commission on visit total before DB writes as requested
        double total = visitRequest.getTotalAmount();
        visit.setTotalAmount(total);
        visit.setCommissionAmount(total * 0.10);
        
        visit.setServices(visitRequest.getServices());
        visit.setNotes(visitRequest.getNotes());

        Visit savedVisit = visitRepository.save(visit);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVisit);
    }
}

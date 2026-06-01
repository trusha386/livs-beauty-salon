package com.salon.controller;

import com.salon.model.SalonService;
import com.salon.repository.ServiceRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping
    public ResponseEntity<List<SalonService>> getAllActiveServices() {
        List<SalonService> services = serviceRepository.findAllByActiveTrue();
        return ResponseEntity.ok(services);
    }

    @PostMapping
    public ResponseEntity<SalonService> createService(@Valid @RequestBody SalonService service) {
        service.setActive(true);
        SalonService savedService = serviceRepository.save(service);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @Valid @RequestBody SalonService serviceDetails) {
        return serviceRepository.findById(id)
                .map(existingService -> {
                    existingService.setName(serviceDetails.getName());
                    existingService.setPrice(serviceDetails.getPrice());
                    existingService.setCategory(serviceDetails.getCategory());
                    existingService.setDescription(serviceDetails.getDescription());
                    if (serviceDetails.getActive() != null) {
                        existingService.setActive(serviceDetails.getActive());
                    }
                    SalonService updatedService = serviceRepository.save(existingService);
                    return ResponseEntity.ok(updatedService);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Service not found with ID: " + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateService(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .map(existingService -> {
                    existingService.setActive(false);
                    serviceRepository.save(existingService);
                    return ResponseEntity.ok("Service deactivated successfully.");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Service not found with ID: " + id));
    }
}

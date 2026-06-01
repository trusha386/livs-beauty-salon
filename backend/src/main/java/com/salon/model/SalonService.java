package com.salon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "salon_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalonService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(length = 100)
    private String category; // e.g., "Hair Care", "Skin Care", "Nails", "Grooming", "Bridal"

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Boolean active = true;
}

package com.salon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "visits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "visit_date", nullable = false)
    private Instant visitDate;

    @Column(name = "staff_username", nullable = false)
    private String staffUsername;

    @Column(name = "staff_display_name", nullable = false)
    private String staffDisplayName;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "commission_amount", nullable = false)
    private Double commissionAmount;

    @Column(nullable = false, length = 1000)
    private String services;

    @Column(length = 1000)
    private String notes;
}

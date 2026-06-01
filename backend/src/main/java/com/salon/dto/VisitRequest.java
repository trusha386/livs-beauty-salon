package com.salon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private Instant visitDate;

    @NotBlank(message = "Staff username is required")
    private String staffUsername;

    @NotBlank(message = "Staff display name is required")
    private String staffDisplayName;

    @NotNull(message = "Total amount is required")
    @Min(value = 0, message = "Total amount cannot be negative")
    private Double totalAmount;

    @NotNull(message = "Commission amount is required")
    @Min(value = 0, message = "Commission amount cannot be negative")
    private Double commissionAmount;

    @NotBlank(message = "Opted services list is required")
    private String services;

    private String notes;
}

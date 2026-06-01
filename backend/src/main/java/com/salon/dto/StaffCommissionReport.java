package com.salon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffCommissionReport {
    private String staffUsername;
    private String staffDisplayName;
    private String role;
    private long visitsLogged;
    private Double totalSalesGenerated;
    private Double calculatedCommission;
}

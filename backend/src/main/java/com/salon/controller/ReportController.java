package com.salon.controller;

import com.salon.dto.MonthlyRevenueReport;
import com.salon.dto.StaffCommissionReport;
import com.salon.model.Visit;
import com.salon.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private VisitRepository visitRepository;

    @GetMapping("/commissions")
    public ResponseEntity<List<StaffCommissionReport>> getCommissionsReport() {
        List<Visit> visits = visitRepository.findAll();
        
        Map<String, StaffCommissionReport> reportMap = new HashMap<>();
        
        for (Visit visit : visits) {
            String username = visit.getStaffUsername();
            StaffCommissionReport report = reportMap.computeIfAbsent(username, k -> {
                StaffCommissionReport newReport = new StaffCommissionReport();
                newReport.setStaffUsername(username);
                newReport.setStaffDisplayName(visit.getStaffDisplayName());
                newReport.setRole("STAFF");
                newReport.setVisitsLogged(0);
                newReport.setTotalSalesGenerated(0.0);
                newReport.setCalculatedCommission(0.0);
                return newReport;
            });
            
            report.setVisitsLogged(report.getVisitsLogged() + 1);
            report.setTotalSalesGenerated(report.getTotalSalesGenerated() + visit.getTotalAmount());
            report.setCalculatedCommission(report.getCalculatedCommission() + visit.getCommissionAmount());
        }
        
        return ResponseEntity.ok(new ArrayList<>(reportMap.values()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<MonthlyRevenueReport>> getRevenueReport() {
        List<Visit> visits = visitRepository.findAll();
        
        Map<String, Double> monthlyMap = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM").withZone(ZoneId.systemDefault());
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM").withZone(ZoneId.systemDefault());
        
        // Seed past 3 months to match the front-end area chart expectation
        for (int i = 2; i >= 0; i--) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -i);
            Instant instant = cal.toInstant();
            String monthKey = formatter.format(instant);
            monthlyMap.put(monthKey, 0.0);
        }
        
        for (Visit visit : visits) {
            String monthKey = formatter.format(visit.getVisitDate());
            if (monthlyMap.containsKey(monthKey)) {
                monthlyMap.put(monthKey, monthlyMap.get(monthKey) + visit.getTotalAmount());
            }
        }
        
        List<MonthlyRevenueReport> reports = monthlyMap.entrySet().stream()
                .map(entry -> {
                    String monthKey = entry.getKey();
                    // parse to get month name label
                    String label = monthKey;
                    try {
                        String[] parts = monthKey.split("-");
                        int monthNum = Integer.parseInt(parts[1]);
                        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                        label = monthNames[monthNum - 1];
                    } catch (Exception ignored) {}
                    
                    return new MonthlyRevenueReport(monthKey, label, entry.getValue());
                })
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(reports);
    }
}

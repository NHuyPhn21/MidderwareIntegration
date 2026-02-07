package com.example.employeemanagement.controller;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.HealthCheckCampaign;
import com.example.employeemanagement.model.HealthCheckResult;
import com.example.employeemanagement.service.HealthCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hrm/health-check")
@CrossOrigin(origins = "*") // Allow all origins for simplicity in dev
public class HealthCheckController {

    @Autowired
    private HealthCheckService healthCheckService;

    // 1. Create Campaign
    @PostMapping("/campaigns")
    public ResponseEntity<HealthCheckCampaign> createCampaign(@RequestBody HealthCheckCampaign campaign) {
        HealthCheckCampaign created = healthCheckService.createCampaign(campaign);
        return ResponseEntity.ok(created);
    }

    // Get all campaigns
    @GetMapping("/campaigns")
    public ResponseEntity<List<HealthCheckCampaign>> getAllCampaigns() {
        return ResponseEntity.ok(healthCheckService.getAllCampaigns());
    }

    // 2. Get Due Employees
    @GetMapping("/due-employees")
    public ResponseEntity<List<Employee>> getDueEmployees() {
        return ResponseEntity.ok(healthCheckService.getDueEmployees());
    }

    // 3. Add employees to campaign
    @PostMapping("/campaigns/{id}/add-employees")
    public ResponseEntity<?> addEmployeesToCampaign(@PathVariable Long id, @RequestBody List<Long> employeeIds) {
        healthCheckService.addEmployeesToCampaign(id, employeeIds);
        return ResponseEntity.ok().body("Employees added to campaign successfully");
    }

    // 4. Sync to HIS (Simulated - just updates status)
    @PostMapping("/campaigns/{id}/sync-to-his")
    public ResponseEntity<?> syncToHis(@PathVariable Long id) {
        healthCheckService.markRequestsAsSent(id);
        return ResponseEntity.ok().body("Campaign synced to HIS (Requests marked as SENT_TO_HIS)");
    }

    // 5. Receive Results from Middleware
    // Expecting payload: { "employeeId": 1, "checkDate": "2026-02-06",
    // "healthStatus": "Type 1", "doctorConclusion": "Good" }
    @PostMapping("/results")
    public ResponseEntity<?> receiveResult(@RequestBody Map<String, Object> payload) {
        try {
            Long employeeId = Long.valueOf(payload.get("employeeId").toString());
            String dateStr = (String) payload.get("checkDate");
            LocalDate checkDate = LocalDate.parse(dateStr);
            String healthStatus = (String) payload.get("healthStatus");
            String conclusion = (String) payload.get("doctorConclusion");

            HealthCheckResult result = healthCheckService.processResult(employeeId, checkDate, healthStatus,
                    conclusion);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing result: " + e.getMessage());
        }
    }
}

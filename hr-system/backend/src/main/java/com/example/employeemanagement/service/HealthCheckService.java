package com.example.employeemanagement.service;

import com.example.employeemanagement.model.*;
import com.example.employeemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HealthCheckService {

    @Autowired
    private HealthCheckCampaignRepository campaignRepository;

    @Autowired
    private HealthCheckRequestRepository requestRepository;

    @Autowired
    private HealthCheckResultRepository resultRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // Create a new campaign
    public HealthCheckCampaign createCampaign(HealthCheckCampaign campaign) {
        campaign.setStatus(HealthCheckCampaign.CampaignStatus.PLANNING);
        return campaignRepository.save(campaign);
    }

    // Get all campaigns
    public List<HealthCheckCampaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    // Identify "Due" Employees (Rule: Last check > 1 year ago or never checked)
    // For simplicity, we create requests for ALL employees who don't have a check
    // in the last year
    public List<Employee> getDueEmployees() {
        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        List<Employee> allEmployees = employeeRepository.findAll();

        // Filter logic can be more complex with custom queries, using stream for
        // simplicity here
        return allEmployees.stream()
                .filter(e -> e.getLastHealthCheckDate() == null || e.getLastHealthCheckDate().isBefore(oneYearAgo))
                .collect(java.util.stream.Collectors.toList());
    }

    // Add employees to campaign (Create Requests)
    @Transactional
    public void addEmployeesToCampaign(Long campaignId, List<Long> employeeIds) {
        HealthCheckCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        for (Long empId : employeeIds) {
            Employee employee = employeeRepository.findById(empId)
                    .orElseThrow(() -> new RuntimeException("Employee not found: " + empId));

            HealthCheckRequest request = new HealthCheckRequest();
            request.setCampaign(campaign);
            request.setEmployee(employee);
            request.setStatus(HealthCheckRequest.RequestStatus.PENDING);

            requestRepository.save(request);
        }
    }

    // Mark requests as sent to HIS
    @Transactional
    public void markRequestsAsSent(Long campaignId) {
        List<HealthCheckRequest> requests = requestRepository.findByCampaignId(campaignId);
        for (HealthCheckRequest req : requests) {
            if (req.getStatus() == HealthCheckRequest.RequestStatus.PENDING) {
                req.setStatus(HealthCheckRequest.RequestStatus.SENT_TO_HIS);
                requestRepository.save(req);
            }
        }

        HealthCheckCampaign campaign = campaignRepository.findById(campaignId).orElseThrow();
        campaign.setStatus(HealthCheckCampaign.CampaignStatus.SCHEDULED);
        campaignRepository.save(campaign);
    }

    // Process result from Middleware/HIS
    @Transactional
    public HealthCheckResult processResult(Long employeeId, LocalDate checkDate, String healthStatus,
            String conclusion) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        // Update Employee's last check date
        if (employee.getLastHealthCheckDate() == null || checkDate.isAfter(employee.getLastHealthCheckDate())) {
            employee.setLastHealthCheckDate(checkDate);
            employeeRepository.save(employee);
        }

        // Create Result Record
        HealthCheckResult result = new HealthCheckResult();
        result.setEmployee(employee);
        result.setCheckDate(checkDate);
        result.setHealthStatus(healthStatus);
        result.setDoctorConclusion(conclusion);

        return resultRepository.save(result);
    }
}

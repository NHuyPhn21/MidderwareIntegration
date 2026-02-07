package com.example.employeemanagement.repository;

import com.example.employeemanagement.model.HealthCheckRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthCheckRequestRepository extends JpaRepository<HealthCheckRequest, Long> {
    List<HealthCheckRequest> findByCampaignId(Long campaignId);

    List<HealthCheckRequest> findByStatus(HealthCheckRequest.RequestStatus status);
}

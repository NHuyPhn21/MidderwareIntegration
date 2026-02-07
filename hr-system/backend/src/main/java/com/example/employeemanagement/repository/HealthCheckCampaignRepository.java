package com.example.employeemanagement.repository;

import com.example.employeemanagement.model.HealthCheckCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthCheckCampaignRepository extends JpaRepository<HealthCheckCampaign, Long> {
}

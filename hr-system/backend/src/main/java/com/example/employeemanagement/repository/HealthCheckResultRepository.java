package com.example.employeemanagement.repository;

import com.example.employeemanagement.model.HealthCheckResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthCheckResultRepository extends JpaRepository<HealthCheckResult, Long> {
    List<HealthCheckResult> findByEmployeeId(Long employeeId);
}

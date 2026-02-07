package com.example.employeemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "health_check_results")
public class HealthCheckResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private LocalDate checkDate;

    // Type 1, Type 2, Type 3, Type 4
    private String healthStatus;

    @Column(columnDefinition = "TEXT")
    private String doctorConclusion;

    // Reference to the original request if needed, optional
    @OneToOne
    @JoinColumn(name = "request_id")
    private HealthCheckRequest request;
}

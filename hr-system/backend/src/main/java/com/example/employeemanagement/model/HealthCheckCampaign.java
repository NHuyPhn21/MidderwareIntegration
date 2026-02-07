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
@Table(name = "health_check_campaigns")
public class HealthCheckCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    @Enumerated(EnumType.STRING)
    private CampaignStatus status;

    public enum CampaignStatus {
        PLANNING,
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED
    }
}

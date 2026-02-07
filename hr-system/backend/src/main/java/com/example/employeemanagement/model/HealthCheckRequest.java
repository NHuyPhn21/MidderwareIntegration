package com.example.employeemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "health_check_requests")
public class HealthCheckRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "campaign_id", nullable = false)
    private HealthCheckCampaign campaign;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    // Stores the ID of the appointment returned by the Hospital System/Middleware
    private String hisAppointmentId;

    public enum RequestStatus {
        PENDING,
        SENT_TO_HIS,
        COMPLETED,
        SKIPPED
    }
}

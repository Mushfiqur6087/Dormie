package com.HMS.hms.Tables;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fund_requests")
public class FundRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @Column(name = "requested_by", nullable = false)
    private Long requestedBy; // Mess manager userId

    @ManyToOne
    @JoinColumn(name = "requested_by", insertable = false, updatable = false)
    private Users requestedByUser;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "reviewed_by")
    private Long reviewedBy; // Provost userId

    @ManyToOne
    @JoinColumn(name = "reviewed_by", insertable = false, updatable = false)
    private Users reviewedByUser;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public FundRequest() {}

    // Constructor with parameters
    public FundRequest(Long requestedBy, String title, String description, BigDecimal amount) {
        this.requestedBy = requestedBy;
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.requestedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(Long requestedBy) {
        this.requestedBy = requestedBy;
    }

    public Users getRequestedByUser() {
        return requestedByUser;
    }

    public void setRequestedByUser(Users requestedByUser) {
        this.requestedByUser = requestedByUser;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Long getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public Users getReviewedByUser() {
        return reviewedByUser;
    }

    public void setReviewedByUser(Users reviewedByUser) {
        this.reviewedByUser = reviewedByUser;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "FundRequest{" +
                "requestId=" + requestId +
                ", requestedBy=" + requestedBy +
                ", title='" + title + '\'' +
                ", amount=" + amount +
                ", status='" + status + '\'' +
                ", requestedAt=" + requestedAt +
                ", reviewedBy=" + reviewedBy +
                ", reviewedAt=" + reviewedAt +
                '}';
    }
}

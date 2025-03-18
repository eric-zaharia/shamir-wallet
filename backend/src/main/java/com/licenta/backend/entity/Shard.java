package com.licenta.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Shard")
public class Shard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String shard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "password_id")
    @JsonBackReference
    private Password password;

}

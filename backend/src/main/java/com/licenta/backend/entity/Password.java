package com.licenta.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.licenta.backend.model.EncryptionKey;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Password")
public class Password {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int shardsNo;
    private int selfCustodyShardsNo;

    @Transient
    private EncryptionKey encryptionKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "password", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shard> shards;
}

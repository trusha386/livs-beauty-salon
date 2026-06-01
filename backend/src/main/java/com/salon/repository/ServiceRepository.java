package com.salon.repository;

import com.salon.model.SalonService;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<SalonService, Long> {
    List<SalonService> findAllByActiveTrue();
}

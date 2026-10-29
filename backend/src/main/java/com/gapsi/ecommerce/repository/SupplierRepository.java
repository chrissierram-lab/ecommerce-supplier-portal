package com.gapsi.ecommerce.repository;

import com.gapsi.ecommerce.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsByNombreNormalizado(String nombreNormalizado);
}

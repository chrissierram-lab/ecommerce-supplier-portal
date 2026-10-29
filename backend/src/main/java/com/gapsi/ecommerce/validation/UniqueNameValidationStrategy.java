// PATRÓN DE DISEÑO 2: STRATEGY
// Esta estrategia valida nombres únicos ignorando espacios y diferencias de mayúsculas.
package com.gapsi.ecommerce.validation;

import com.gapsi.ecommerce.error.DuplicateSupplierException;
import com.gapsi.ecommerce.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UniqueNameValidationStrategy implements SupplierValidationStrategy {

    private final SupplierRepository supplierRepository;

    @Override
    public void validate(String nombre) {
        String normalizedName = SupplierNameNormalizer.normalize(nombre);
        if (supplierRepository.existsByNombreNormalizado(normalizedName)) {
            throw new DuplicateSupplierException();
        }
    }
}

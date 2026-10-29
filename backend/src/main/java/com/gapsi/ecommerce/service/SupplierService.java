package com.gapsi.ecommerce.service;

import java.util.Locale;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import com.gapsi.ecommerce.dto.CreateSupplierRequest;
import com.gapsi.ecommerce.dto.SupplierDTO;
import com.gapsi.ecommerce.error.DuplicateSupplierException;
import com.gapsi.ecommerce.error.InvalidRequestException;
import com.gapsi.ecommerce.error.SupplierNotFoundException;
import com.gapsi.ecommerce.mapping.ApplicationMapper;
import com.gapsi.ecommerce.model.Supplier;
import com.gapsi.ecommerce.repository.SupplierRepository;
import com.gapsi.ecommerce.validation.SupplierNameNormalizer;
import com.gapsi.ecommerce.validation.SupplierValidationStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierValidationStrategy validationStrategy;
    private final ApplicationMapper mapper;

    @Transactional(readOnly = true)
    public Page<SupplierDTO> findAll(int page, int size) {
        if (page < 0) {
            throw new InvalidRequestException("La página debe ser mayor o igual a 0.");
        }
        if (size < 1) {
            throw new InvalidRequestException("El tamaño de página debe ser mayor que 0.");
        }
        return supplierRepository.findAll(PageRequest.of(page, size, Sort.by("id")))
                .map(mapper::toSupplierDto);
    }

    @Transactional
    public SupplierDTO create(@Valid @NotNull CreateSupplierRequest request) {
        String nombre = request.getNombre().strip();
        String normalizedName = SupplierNameNormalizer.normalize(nombre);
        if (normalizedName.isEmpty()) {
            throw new InvalidRequestException("El nombre es obligatorio.");
        }
        validationStrategy.validate(nombre);

        Supplier supplier = new Supplier(
                nombre,
                normalizedName,
                request.getRazonSocial().strip(),
                request.getDireccion().strip());
        try {
            return mapper.toSupplierDto(supplierRepository.saveAndFlush(supplier));
        } catch (DataIntegrityViolationException exception) {
            if (isNormalizedNameViolation(exception)) {
                throw new DuplicateSupplierException(exception);
            }
            throw exception;
        }
    }

    @Transactional
    public void delete(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException(id));
        supplierRepository.delete(supplier);
    }

    private boolean isNormalizedNameViolation(DataIntegrityViolationException exception) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof org.hibernate.exception.ConstraintViolationException) {
                String name = ((org.hibernate.exception.ConstraintViolationException) cause).getConstraintName();
                if (name != null && name.toLowerCase(Locale.ROOT).contains(Supplier.UNIQUE_NAME_CONSTRAINT)) {
                    return true;
                }
            }
            cause = cause.getCause();
        }
        return false;
    }
}

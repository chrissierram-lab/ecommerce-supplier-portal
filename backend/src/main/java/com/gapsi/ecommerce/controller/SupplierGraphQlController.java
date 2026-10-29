package com.gapsi.ecommerce.controller;

import com.gapsi.ecommerce.dto.CreateSupplierRequest;
import com.gapsi.ecommerce.dto.SupplierDTO;
import com.gapsi.ecommerce.error.InvalidRequestException;
import com.gapsi.ecommerce.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SupplierGraphQlController {

    private final SupplierService supplierService;

    @QueryMapping
    public Page<SupplierDTO> suppliers(@Argument("page") Integer page, @Argument("size") Integer size) {
        return supplierService.findAll(page == null ? 0 : page, size == null ? 10 : size);
    }

    @MutationMapping
    public SupplierDTO createSupplier(@Argument("input") CreateSupplierRequest input) {
        return supplierService.create(input);
    }

    @MutationMapping
    public boolean deleteSupplier(@Argument("id") String id) {
        long supplierId;
        try {
            supplierId = Long.parseLong(id);
        } catch (NumberFormatException exception) {
            throw new InvalidRequestException("El identificador del proveedor no es válido.");
        }
        supplierService.delete(supplierId);
        return true;
    }

    @SchemaMapping(typeName = "Supplier", field = "fechaCreacion")
    public String creationDate(SupplierDTO supplier) {
        return supplier.getFechaCreacion().toString();
    }
}

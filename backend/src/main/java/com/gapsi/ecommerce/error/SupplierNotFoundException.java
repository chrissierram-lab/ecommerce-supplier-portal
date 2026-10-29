package com.gapsi.ecommerce.error;

public class SupplierNotFoundException extends RuntimeException {

    public SupplierNotFoundException(Long id) {
        super("No se encontró el proveedor con id " + id + ".");
    }
}

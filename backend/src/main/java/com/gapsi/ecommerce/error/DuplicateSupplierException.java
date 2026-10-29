package com.gapsi.ecommerce.error;

public class DuplicateSupplierException extends RuntimeException {

    private static final String MESSAGE = "El proveedor con ese nombre ya existe en la lista.";

    public DuplicateSupplierException() {
        super(MESSAGE);
    }

    public DuplicateSupplierException(Throwable cause) {
        super(MESSAGE, cause);
    }
}

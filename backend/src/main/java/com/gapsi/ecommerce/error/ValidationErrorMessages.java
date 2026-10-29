package com.gapsi.ecommerce.error;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

final class ValidationErrorMessages {

    private ValidationErrorMessages() {
    }

    static String from(ConstraintViolationException exception) {
        return exception.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .sorted()
                .findFirst()
                .orElse("Los datos de la solicitud no son válidos.");
    }
}

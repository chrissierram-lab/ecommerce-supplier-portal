// PATRÓN DE DISEÑO 2: STRATEGY
// El contrato permite intercambiar la regla de validación sin modificar el servicio.
package com.gapsi.ecommerce.validation;

public interface SupplierValidationStrategy {

    void validate(String nombre);
}

package com.gapsi.ecommerce.validation;

import java.util.Locale;

public final class SupplierNameNormalizer {

    private SupplierNameNormalizer() {
    }

    public static String normalize(String nombre) {
        StringBuilder withoutSpaces = new StringBuilder(nombre.length());
        nombre.codePoints()
                .filter(codePoint -> !Character.isWhitespace(codePoint) && !Character.isSpaceChar(codePoint))
                .forEach(withoutSpaces::appendCodePoint);
        return withoutSpaces.toString().toUpperCase(Locale.ROOT).toLowerCase(Locale.ROOT);
    }
}

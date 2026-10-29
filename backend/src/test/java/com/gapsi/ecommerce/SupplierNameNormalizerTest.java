package com.gapsi.ecommerce;

import static org.assertj.core.api.Assertions.assertThat;

import com.gapsi.ecommerce.validation.SupplierNameNormalizer;
import org.junit.jupiter.api.Test;

class SupplierNameNormalizerTest {

    @Test
    void ignoresCaseAndJavaRecognizedWhitespace() {
        assertThat(SupplierNameNormalizer.normalize(" A\u00a0C\tME "))
                .isEqualTo(SupplierNameNormalizer.normalize("aCmE"));
        assertThat(SupplierNameNormalizer.normalize("Straße"))
                .isEqualTo(SupplierNameNormalizer.normalize("STRASSE"));
        assertThat(SupplierNameNormalizer.normalize("\u2003\u00a0\t")).isEmpty();
    }

    @Test
    void retainsCharactersOutsideJavaWhitespaceAndSpaceChar() {
        String plain = SupplierNameNormalizer.normalize("AB");
        assertThat(SupplierNameNormalizer.normalize("A\u0085B"))
                .isEqualTo("a\u0085b")
                .isNotEqualTo(plain);
        assertThat(SupplierNameNormalizer.normalize("A\u200BB"))
                .isEqualTo("a\u200Bb")
                .isNotEqualTo(plain);
    }
}

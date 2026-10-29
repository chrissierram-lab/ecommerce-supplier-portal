package com.gapsi.ecommerce;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class JavaVersionTest {

    @Test
    void testsRunOnJava11() {
        assertThat(Runtime.version().feature()).isEqualTo(11);
        assertThatCode(() -> GapsiApplication.requireJava11(11)).doesNotThrowAnyException();
    }

    @ParameterizedTest
    @ValueSource(ints = {8, 17, 21})
    void rejectsOtherJavaVersions(int version) {
        assertThatThrownBy(() -> GapsiApplication.requireJava11(version))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Este backend requiere Java 11, pero se detectó Java " + version + ".");
    }
}

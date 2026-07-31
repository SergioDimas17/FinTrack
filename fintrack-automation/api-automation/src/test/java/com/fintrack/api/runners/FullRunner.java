package com.fintrack.api.runners;

import com.intuit.karate.junit5.Karate;

class FullRunner {

    @Karate.Test
    Karate testAll() {
        return Karate.run("classpath:features")
                .relativeTo(getClass());
    }
}

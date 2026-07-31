package com.fintrack.api.runners;

import com.intuit.karate.junit5.Karate;

class SmokeRunner {

    @Karate.Test
    Karate testSmoke() {
        return Karate.run("classpath:features")
                .tags("@smoke")
                .relativeTo(getClass());
    }
}

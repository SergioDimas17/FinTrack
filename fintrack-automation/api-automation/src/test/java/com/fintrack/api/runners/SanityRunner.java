package com.fintrack.api.runners;

import com.intuit.karate.junit5.Karate;

class SanityRunner {

    @Karate.Test
    Karate testSanity() {
        return Karate.run("classpath:features")
                .tags("@sanity")
                .relativeTo(getClass());
    }
}

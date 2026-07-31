package com.fintrack.api.runners;

import com.intuit.karate.junit5.Karate;

class RegressionRunner {

    @Karate.Test
    Karate testRegression() {
        return Karate.run("classpath:features")
                .tags("@regression")
                .relativeTo(getClass());
    }
}

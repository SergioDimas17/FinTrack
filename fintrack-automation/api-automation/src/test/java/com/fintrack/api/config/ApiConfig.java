package com.fintrack.api.config;

import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import org.junit.jupiter.api.Assertions;

public class ApiConfig {

    public static void runTests(String tag) {
        Results results = Runner.builder()
                .tags(tag)
                .relativeTo(ApiConfig.class)
                .outputCucumberJson(true)
                .outputHtmlReport(true)
                .outputJunitXml(true)
                .parallel(1);
        Assertions.assertEquals(0, results.getFailCount(), results.getErrorMessages());
    }
}
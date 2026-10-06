package com.schoolsystem.backend.finance.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Context class in the Strategy Pattern.
 * Holds references to the available FeeCalculationStrategy implementations
 * and coordinates strategy retrieval and dynamic switching.
 */
@Component
public class FeeStrategyContext {

    private final Map<String, FeeCalculationStrategy> strategies = new ConcurrentHashMap<>();
    private FeeCalculationStrategy activeStrategy;

    @Autowired
    public FeeStrategyContext(StandardFeeCalculationStrategy standardStrategy,
                              ScholarshipFeeCalculationStrategy scholarshipStrategy,
                              LateFeePenaltyCalculationStrategy lateFeeStrategy) {
        registerStrategy(standardStrategy);
        registerStrategy(scholarshipStrategy);
        registerStrategy(lateFeeStrategy);
        this.activeStrategy = standardStrategy;
    }

    public void registerStrategy(FeeCalculationStrategy strategy) {
        if (strategy != null && strategy.getStrategyName() != null) {
            strategies.put(strategy.getStrategyName().toUpperCase(), strategy);
        }
    }

    public FeeCalculationStrategy getActiveStrategy() {
        return activeStrategy != null ? activeStrategy : strategies.get("STANDARD");
    }

    public void setActiveStrategy(FeeCalculationStrategy strategy) {
        if (strategy != null) {
            this.activeStrategy = strategy;
        }
    }

    public void setActiveStrategyByName(String strategyName) {
        if (strategyName != null && strategies.containsKey(strategyName.toUpperCase())) {
            this.activeStrategy = strategies.get(strategyName.toUpperCase());
        }
    }

    public FeeCalculationStrategy getStrategy(String strategyName) {
        if (strategyName == null) {
            return getActiveStrategy();
        }
        return strategies.getOrDefault(strategyName.toUpperCase(), getActiveStrategy());
    }

    public Map<String, FeeCalculationStrategy> getAllStrategies() {
        return Map.copyOf(strategies);
    }
}

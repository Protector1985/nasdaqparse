function measureExecutionTime(fn) {
    // Return a new function
    return function(...args) {
        // Record start time
        const startTime = performance.now();

        // Call the original function
        const result = fn(...args);

        // Record end time
        const endTime = performance.now();

        // Calculate the execution time
        const executionTime = endTime - startTime;

        console.log(`Execution time of function: ${executionTime} milliseconds`);

        // Return the original result
        return result;
    }
}

module.exports = measureExecutionTime;
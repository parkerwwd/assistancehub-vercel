#!/usr/bin/env node

/**
 * Load Testing Script for AssistanceHub
 * 
 * This script simulates heavy traffic to test performance optimizations
 * Run with: node scripts/load-test.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_URL || 'https://assistancehub-hai.vercel.app',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 50,
  testDuration: parseInt(process.env.TEST_DURATION) || 60, // seconds
  requestDelay: parseInt(process.env.REQUEST_DELAY) || 1000, // ms between requests
};

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Homepage Load',
    path: '/',
    weight: 30 // 30% of traffic
  },
  {
    name: 'State Search',
    path: '/section8?state=CA',
    weight: 25
  },
  {
    name: 'City Search',
    path: '/section8?city=Los%20Angeles',
    weight: 20
  },
  {
    name: 'PHA Detail View',
    path: '/pha/1', // Adjust based on actual PHA IDs
    weight: 15
  },
  {
    name: 'Search API',
    path: '/api/search?q=housing',
    weight: 10
  }
];

// Statistics tracking
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  responseTimes: [],
  statusCodes: {},
  errors: []
};

// Make HTTP request
function makeRequest(url, scenario) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Update statistics
        stats.totalRequests++;
        stats.totalResponseTime += responseTime;
        stats.responseTimes.push(responseTime);
        
        if (responseTime < stats.minResponseTime) {
          stats.minResponseTime = responseTime;
        }
        if (responseTime > stats.maxResponseTime) {
          stats.maxResponseTime = responseTime;
        }
        
        // Track status codes
        const statusCode = res.statusCode;
        stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
        
        if (statusCode >= 200 && statusCode < 300) {
          stats.successfulRequests++;
        } else {
          stats.failedRequests++;
        }
        
        resolve({
          scenario: scenario.name,
          statusCode,
          responseTime,
          success: statusCode >= 200 && statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      stats.totalRequests++;
      stats.failedRequests++;
      stats.errors.push(error.message);
      
      resolve({
        scenario: scenario.name,
        error: error.message,
        success: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      stats.totalRequests++;
      stats.failedRequests++;
      stats.errors.push('Request timeout');
      
      resolve({
        scenario: scenario.name,
        error: 'Request timeout',
        success: false
      });
    });
  });
}

// Select random scenario based on weights
function selectScenario() {
  const totalWeight = TEST_SCENARIOS.reduce((sum, scenario) => sum + scenario.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const scenario of TEST_SCENARIOS) {
    random -= scenario.weight;
    if (random <= 0) {
      return scenario;
    }
  }
  
  return TEST_SCENARIOS[0]; // fallback
}

// Run single user simulation
async function runUserSimulation(userId) {
  const startTime = Date.now();
  const endTime = startTime + (CONFIG.testDuration * 1000);
  
  console.log(`🚀 Starting user simulation ${userId}`);
  
  while (Date.now() < endTime) {
    const scenario = selectScenario();
    const url = `${CONFIG.baseUrl}${scenario.path}`;
    
    try {
      const result = await makeRequest(url, scenario);
      
      if (result.success) {
        console.log(`✅ User ${userId}: ${scenario.name} - ${result.responseTime}ms`);
      } else {
        console.log(`❌ User ${userId}: ${scenario.name} - ${result.error || result.statusCode}`);
      }
    } catch (error) {
      console.log(`💥 User ${userId}: ${scenario.name} - ${error.message}`);
    }
    
    // Wait before next request
    await new Promise(resolve => setTimeout(resolve, CONFIG.requestDelay));
  }
  
  console.log(`🏁 User simulation ${userId} completed`);
}

// Calculate statistics
function calculateStats() {
  const avgResponseTime = stats.totalResponseTime / stats.totalRequests;
  
  // Calculate percentiles
  const sortedTimes = stats.responseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  return {
    totalRequests: stats.totalRequests,
    successfulRequests: stats.successfulRequests,
    failedRequests: stats.failedRequests,
    successRate: (stats.successfulRequests / stats.totalRequests * 100).toFixed(2),
    avgResponseTime: avgResponseTime.toFixed(2),
    minResponseTime: stats.minResponseTime,
    maxResponseTime: stats.maxResponseTime,
    p50ResponseTime: p50,
    p95ResponseTime: p95,
    p99ResponseTime: p99,
    requestsPerSecond: (stats.totalRequests / CONFIG.testDuration).toFixed(2),
    statusCodes: stats.statusCodes,
    errors: stats.errors.slice(0, 10) // Show first 10 errors
  };
}

// Print results
function printResults() {
  const results = calculateStats();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Test Duration: ${CONFIG.testDuration} seconds`);
  console.log(`Concurrent Users: ${CONFIG.concurrentUsers}`);
  console.log(`Target URL: ${CONFIG.baseUrl}`);
  console.log('');
  
  console.log('📈 PERFORMANCE METRICS:');
  console.log(`Total Requests: ${results.totalRequests}`);
  console.log(`Successful Requests: ${results.successfulRequests}`);
  console.log(`Failed Requests: ${results.failedRequests}`);
  console.log(`Success Rate: ${results.successRate}%`);
  console.log(`Requests/Second: ${results.requestsPerSecond}`);
  console.log('');
  
  console.log('⏱️ RESPONSE TIMES:');
  console.log(`Average: ${results.avgResponseTime}ms`);
  console.log(`Min: ${results.minResponseTime}ms`);
  console.log(`Max: ${results.maxResponseTime}ms`);
  console.log(`50th Percentile: ${results.p50ResponseTime}ms`);
  console.log(`95th Percentile: ${results.p95ResponseTime}ms`);
  console.log(`99th Percentile: ${results.p99ResponseTime}ms`);
  console.log('');
  
  console.log('🔢 STATUS CODES:');
  Object.entries(results.statusCodes).forEach(([code, count]) => {
    console.log(`${code}: ${count}`);
  });
  
  if (results.errors.length > 0) {
    console.log('');
    console.log('❌ ERRORS:');
    results.errors.forEach(error => console.log(`- ${error}`));
  }
  
  console.log('');
  console.log('🎯 PERFORMANCE ASSESSMENT:');
  
  // Performance assessment
  if (results.successRate < 95) {
    console.log('🔴 ERROR RATE TOO HIGH - Success rate below 95%');
  } else if (results.successRate < 99) {
    console.log('🟡 WARNING - Success rate below 99%');
  } else {
    console.log('🟢 EXCELLENT - Success rate above 99%');
  }
  
  if (results.p95ResponseTime > 3000) {
    console.log('🔴 SLOW RESPONSE - 95th percentile above 3 seconds');
  } else if (results.p95ResponseTime > 1000) {
    console.log('🟡 MODERATE RESPONSE - 95th percentile above 1 second');
  } else {
    console.log('🟢 FAST RESPONSE - 95th percentile under 1 second');
  }
  
  if (results.requestsPerSecond < 10) {
    console.log('🔴 LOW THROUGHPUT - Less than 10 requests/second');
  } else if (results.requestsPerSecond < 50) {
    console.log('🟡 MODERATE THROUGHPUT - Less than 50 requests/second');
  } else {
    console.log('🟢 HIGH THROUGHPUT - Over 50 requests/second');
  }
  
  console.log('='.repeat(50));
}

// Main execution
async function main() {
  console.log('🏁 Starting Load Test...');
  console.log(`Configuration: ${CONFIG.concurrentUsers} users, ${CONFIG.testDuration}s duration`);
  console.log(`Target: ${CONFIG.baseUrl}`);
  console.log('');
  
  // Start user simulations
  const promises = [];
  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    promises.push(runUserSimulation(i + 1));
  }
  
  // Wait for all simulations to complete
  await Promise.all(promises);
  
  // Print results
  printResults();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  printResults();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  printResults();
  process.exit(0);
});

// Run the test
main().catch(console.error); 
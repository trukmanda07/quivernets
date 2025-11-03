#!/usr/bin/env tsx
/**
 * Build Performance Measurement Script
 *
 * Measures build time and collects performance metrics for the Quiver Learn project.
 * Used to establish baseline and track improvements from Phase 1 optimizations.
 *
 * Usage:
 *   npm run benchmark              # Run full benchmark suite
 *   npm run benchmark -- --quick   # Run single build (faster)
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const execAsync = promisify(exec);

interface BenchmarkResult {
  scenario: string;
  buildTime: number; // milliseconds
  timestamp: string;
  postCount: number;
  pageCount: number;
  cacheHitRate?: number;
  collectionCallCount?: number;
}

interface BenchmarkSummary {
  runs: BenchmarkResult[];
  average: number;
  min: number;
  max: number;
  stdDev: number;
}

/**
 * Clean build artifacts to ensure fresh build
 */
async function cleanBuild(): Promise<void> {
  console.log('  Cleaning build artifacts...');
  try {
    rmSync('dist', { recursive: true, force: true });
    rmSync('.astro', { recursive: true, force: true });
  } catch (error) {
    // Ignore errors if directories don't exist
  }
}

/**
 * Run a single build and measure time
 */
async function runBuild(scenario: string): Promise<BenchmarkResult> {
  console.log(`\n📊 Running: ${scenario}`);

  const startTime = Date.now();

  try {
    const { stdout } = await execAsync('npm run build', {
      env: { ...process.env, NODE_ENV: 'production' },
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large outputs
    });

    const buildTime = Date.now() - startTime;

    // Parse output for metrics
    const pageCountMatch = stdout.match(/(\d+) page\(s\) built/);
    const pageCount = pageCountMatch ? parseInt(pageCountMatch[1], 10) : 0;

    // Count blog posts (from log messages)
    const postEnMatch = stdout.match(/Loaded (\d+) posts from blog-en/);
    const postIdMatch = stdout.match(/Loaded (\d+) posts from blog-id/);
    const postCount =
      (postEnMatch ? parseInt(postEnMatch[1], 10) : 0) +
      (postIdMatch ? parseInt(postIdMatch[1], 10) : 0);

    console.log(`  ✓ Completed in ${(buildTime / 1000).toFixed(2)}s`);
    console.log(`  📄 Pages: ${pageCount}, Posts: ${postCount}`);

    return {
      scenario,
      buildTime,
      timestamp: new Date().toISOString(),
      postCount,
      pageCount,
    };
  } catch (error) {
    console.error(`  ✗ Build failed:`, error);
    throw error;
  }
}

/**
 * Calculate statistics for multiple runs
 */
function calculateStats(results: BenchmarkResult[]): BenchmarkSummary {
  const times = results.map(r => r.buildTime);

  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  // Standard deviation
  const variance = times.reduce((sum, time) =>
    sum + Math.pow(time - average, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  return { runs: results, average, min, max, stdDev };
}

/**
 * Load previous baseline if exists
 */
function loadPreviousBaseline(): BenchmarkSummary | null {
  const baselinePath = 'benchmark-baseline.json';
  if (existsSync(baselinePath)) {
    const data = readFileSync(baselinePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

/**
 * Save benchmark results
 */
function saveResults(summary: BenchmarkSummary, filename: string): void {
  const resultsPath = join(process.cwd(), filename);
  writeFileSync(resultsPath, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Results saved to: ${filename}`);
}

/**
 * Display benchmark summary
 */
function displaySummary(summary: BenchmarkSummary, baseline?: BenchmarkSummary | null): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 BENCHMARK SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n⏱️  Build Times:`);
  console.log(`   Average: ${(summary.average / 1000).toFixed(2)}s`);
  console.log(`   Min:     ${(summary.min / 1000).toFixed(2)}s`);
  console.log(`   Max:     ${(summary.max / 1000).toFixed(2)}s`);
  console.log(`   Std Dev: ${(summary.stdDev / 1000).toFixed(2)}s`);

  if (summary.runs.length > 0) {
    const firstRun = summary.runs[0];
    console.log(`\n📄 Content:`);
    console.log(`   Posts: ${firstRun.postCount}`);
    console.log(`   Pages: ${firstRun.pageCount}`);
  }

  if (baseline) {
    const improvement = ((baseline.average - summary.average) / baseline.average) * 100;
    const improvementSymbol = improvement > 0 ? '🚀' : '⚠️';

    console.log(`\n${improvementSymbol} Comparison to Baseline:`);
    console.log(`   Previous:    ${(baseline.average / 1000).toFixed(2)}s`);
    console.log(`   Current:     ${(summary.average / 1000).toFixed(2)}s`);
    console.log(`   Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);

    if (improvement >= 40) {
      console.log(`   ✅ SUCCESS: Exceeded 40% improvement target!`);
    } else if (improvement >= 20) {
      console.log(`   ⚠️  PARTIAL: Improvement below target but positive`);
    } else if (improvement < 0) {
      console.log(`   ❌ REGRESSION: Performance degraded`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Main benchmark function
 */
async function main(): Promise<void> {
  console.log('🚀 Build Performance Benchmark');
  console.log('='.repeat(60));

  const args = process.argv.slice(2);
  const quickMode = args.includes('--quick');
  const runs = quickMode ? 1 : 3;

  console.log(`Mode: ${quickMode ? 'Quick (1 run)' : 'Full (3 runs)'}`);
  console.log('='.repeat(60));

  const results: BenchmarkResult[] = [];

  // Run benchmark(s)
  for (let i = 1; i <= runs; i++) {
    await cleanBuild();

    console.log(`\n[${i}/${runs}] Clean Build`);
    const result = await runBuild(`clean-build-${i}`);
    results.push(result);

    // Small delay between runs
    if (i < runs) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Calculate and display summary
  const summary = calculateStats(results);
  const baseline = loadPreviousBaseline();

  displaySummary(summary, baseline);

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  saveResults(summary, `benchmark-results-${timestamp}.json`);

  // If this is the first run (no baseline), save as baseline
  if (!baseline) {
    saveResults(summary, 'benchmark-baseline.json');
    console.log('\n📌 This is the first run - results saved as baseline');
  }

  console.log('\n✅ Benchmark complete!');

  // Exit with error code if regression detected
  if (baseline) {
    const improvement = ((baseline.average - summary.average) / baseline.average) * 100;
    if (improvement < -5) { // More than 5% slower
      console.error('\n❌ Performance regression detected!');
      process.exit(1);
    }
  }
}

// Run benchmark
main().catch((error) => {
  console.error('\n❌ Benchmark failed:', error);
  process.exit(1);
});

/**
 * Property-based tests for time tracking
 * 
 * 
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Mock types for testing
interface TimerState {
  projectId: string;
  description: string;
  startTime: Date;
  isRunning: boolean;
}

interface TimeEntry {
  id: string;
  projectId: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
}

interface DateGroup {
  date: string; // YYYY-MM-DD format
  entries: TimeEntry[];
  totalDuration: number;
}

/**
 * Serializes timer state to localStorage format
 */
function serializeTimerState(state: TimerState): string {
  return JSON.stringify({
    projectId: state.projectId,
    description: state.description,
    startTime: state.startTime.toISOString(),
    isRunning: state.isRunning,
  });
}

/**
 * Deserializes timer state from localStorage
 */
function deserializeTimerState(json: string): TimerState {
  const parsed = JSON.parse(json);
  return {
    projectId: parsed.projectId,
    description: parsed.description,
    startTime: new Date(parsed.startTime),
    isRunning: parsed.isRunning,
  };
}

/**
 * Calculates duration in seconds between start and end times
 */
function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Calculates elapsed time for a running timer
 */
function calculateElapsedTime(startTime: Date, currentTime: Date): number {
  return Math.round((currentTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Groups time entries by date
 */
function groupEntriesByDate(entries: TimeEntry[]): DateGroup[] {
  const groups = new Map<string, TimeEntry[]>();
  
  for (const entry of entries) {
    const dateKey = entry.startTime.toISOString().split('T')[0];
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(entry);
  }
  
  return Array.from(groups.entries()).map(([date, entries]) => ({
    date,
    entries,
    totalDuration: entries.reduce((sum, entry) => sum + entry.duration, 0),
  }));
}

/**
 * Formats date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Arbitraries
const timerStateArb = fc.record({
  projectId: fc.uuid(),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  startTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  isRunning: fc.boolean(),
}).filter(state => !isNaN(state.startTime.getTime()));

const timeEntryArb = fc.record({
  id: fc.uuid(),
  projectId: fc.uuid(),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  startTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  endTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  duration: fc.integer({ min: 0, max: 86400 }), // 0 to 24 hours in seconds
}).filter(entry => !isNaN(entry.startTime.getTime()) && !isNaN(entry.endTime.getTime()));

describe('Time Tracking Property Tests', () => {
  /**
   * 
   * *For any* running timer state saved to localStorage, restoring from localStorage 
   * SHALL produce a timer with the same projectId, description, and a startTime that 
   * allows calculating correct elapsed time.
   * 
   */
  it('Property 25: Timer State Persistence - round-trip preserves state', () => {
    fc.assert(
      fc.property(
        timerStateArb,
        (state) => {
          const serialized = serializeTimerState(state);
          const deserialized = deserializeTimerState(serialized);
          
          expect(deserialized.projectId).toBe(state.projectId);
          expect(deserialized.description).toBe(state.description);
          expect(deserialized.isRunning).toBe(state.isRunning);
          
          // Start time should be equivalent (within 1 second due to serialization)
          const timeDiff = Math.abs(
            deserialized.startTime.getTime() - state.startTime.getTime()
          );
          expect(timeDiff).toBeLessThan(1000);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 25 (continued): Elapsed time calculation is consistent after restore
   */
  it('Property 25: Timer State Persistence - elapsed time calculation after restore', () => {
    fc.assert(
      fc.property(
        timerStateArb.filter(state => state.isRunning),
        fc.integer({ min: 1, max: 3600 }), // Seconds elapsed
        (state, secondsElapsed) => {
          const serialized = serializeTimerState(state);
          const deserialized = deserializeTimerState(serialized);
          
          // Simulate time passing
          const currentTime = new Date(state.startTime.getTime() + secondsElapsed * 1000);
          
          const originalElapsed = calculateElapsedTime(state.startTime, currentTime);
          const restoredElapsed = calculateElapsedTime(deserialized.startTime, currentTime);
          
          // Elapsed time should be the same (within 1 second)
          expect(Math.abs(originalElapsed - restoredElapsed)).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* time entry with start and end times, the duration SHALL equal 
   * the difference between end time and start time in seconds.
   * 
   */
  it('Property 26: Duration Calculation - equals time difference in seconds', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        fc.integer({ min: 1, max: 86400 }), // 1 second to 24 hours
        (startTime, durationSeconds) => {
          // Filter out invalid dates
          if (isNaN(startTime.getTime())) {
            return true; // Skip invalid dates
          }
          
          const endTime = new Date(startTime.getTime() + durationSeconds * 1000);
          
          const calculatedDuration = calculateDuration(startTime, endTime);
          
          expect(calculatedDuration).toBe(durationSeconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26 (continued): Duration is always non-negative
   */
  it('Property 26: Duration Calculation - always non-negative', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        (date1, date2) => {
          // Filter out invalid dates
          if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            return true; // Skip invalid dates
          }
          
          // Ensure startTime is before endTime
          const startTime = date1 < date2 ? date1 : date2;
          const endTime = date1 < date2 ? date2 : date1;
          
          const duration = calculateDuration(startTime, endTime);
          
          expect(duration).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26 (continued): Duration calculation is precise
   */
  it('Property 26: Duration Calculation - handles millisecond precision', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 86400000 }), // Milliseconds in a day
        (milliseconds) => {
          const startTime = new Date('2025-01-01T00:00:00.000Z');
          const endTime = new Date(startTime.getTime() + milliseconds);
          
          const duration = calculateDuration(startTime, endTime);
          const expectedSeconds = Math.round(milliseconds / 1000);
          
          expect(duration).toBe(expectedSeconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 
   * *For any* set of time entries, grouping by date SHALL produce groups where 
   * all entries in each group have the same date, and daily totals equal the sum 
   * of durations for that date.
   * 
   */
  it('Property 27: Time Entry Date Grouping - entries grouped by date', () => {
    fc.assert(
      fc.property(
        fc.array(timeEntryArb, { minLength: 1, maxLength: 50 }),
        (entries) => {
          const groups = groupEntriesByDate(entries);
          
          // Each group should have entries from the same date
          for (const group of groups) {
            for (const entry of group.entries) {
              const entryDate = formatDate(entry.startTime);
              expect(entryDate).toBe(group.date);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27 (continued): Daily totals equal sum of durations
   */
  it('Property 27: Time Entry Date Grouping - daily totals are correct', () => {
    fc.assert(
      fc.property(
        fc.array(timeEntryArb, { minLength: 1, maxLength: 50 }),
        (entries) => {
          const groups = groupEntriesByDate(entries);
          
          // Each group's total should equal sum of its entries
          for (const group of groups) {
            const manualTotal = group.entries.reduce(
              (sum, entry) => sum + entry.duration,
              0
            );
            expect(group.totalDuration).toBe(manualTotal);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27 (continued): All entries are included in groups
   */
  it('Property 27: Time Entry Date Grouping - all entries included', () => {
    fc.assert(
      fc.property(
        fc.array(timeEntryArb, { minLength: 1, maxLength: 50 }),
        (entries) => {
          const groups = groupEntriesByDate(entries);
          
          // Count total entries in all groups
          const totalGroupedEntries = groups.reduce(
            (sum, group) => sum + group.entries.length,
            0
          );
          
          expect(totalGroupedEntries).toBe(entries.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27 (continued): Empty entries produce empty groups
   */
  it('Property 27: Time Entry Date Grouping - handles empty input', () => {
    const groups = groupEntriesByDate([]);
    expect(groups.length).toBe(0);
  });

  /**
   * Property 27 (continued): Single entry produces single group
   */
  it('Property 27: Time Entry Date Grouping - single entry single group', () => {
    fc.assert(
      fc.property(
        timeEntryArb,
        (entry) => {
          const groups = groupEntriesByDate([entry]);
          
          expect(groups.length).toBe(1);
          expect(groups[0].entries.length).toBe(1);
          expect(groups[0].entries[0]).toEqual(entry);
          expect(groups[0].totalDuration).toBe(entry.duration);
        }
      ),
      { numRuns: 100 }
    );
  });
});

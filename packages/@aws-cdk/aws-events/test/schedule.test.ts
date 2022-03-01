import { Duration, Stack, Lazy } from '@aws-cdk/core';
import * as events from '../lib';

describe('schedule', () => {
  test('cron expressions day and dow are mutex: given weekday', () => {
    // Run every 10 minutes Monday through Friday
    expect('cron(0/10 * ? * MON-FRI *)').toEqual(events.Schedule.cron({
      minute: '0/10',
      weekDay: 'MON-FRI',
    }).expressionString);
  });

  test('cron expressions day and dow are mutex: given month day', () => {
    // Run at 8:00 am (UTC) every 1st day of the month
    expect('cron(0 8 1 * ? *)').toEqual(events.Schedule.cron({
      minute: '0',
      hour: '8',
      day: '1',
    }).expressionString);
  });

  test('cron expressions day and dow are mutex: given neither', () => {
    // Run at 10:00 am (UTC) every day
    expect('cron(0 10 * * ? *)').toEqual(events.Schedule.cron({
      minute: '0',
      hour: '10',
    }).expressionString);
  });

  test('warning message is included in Schedule when cron does not include minute', () => {
    expect(events.Schedule.cron({
      hour: '8',
      day: '1',
    }).minuteUndefinedWarning).toEqual("When 'minute' is undefined in CronOptions, '*' is used as the default value, scheduling the event for every minute within the supplied parameters.");
  });

  test('rate must be whole number of minutes', () => {
    expect(() => {
      events.Schedule.rate(Duration.minutes(0.13456));
    }).toThrow(/'0.13456 minutes' cannot be converted into a whole number of seconds/);
  });

  test('rate must be whole number', () => {
    expect(() => {
      events.Schedule.rate(Duration.minutes(1/8));
    }).toThrow(/'0.125 minutes' cannot be converted into a whole number of seconds/);
  });

  test('rate cannot be 0', () => {
    expect(() => {
      events.Schedule.rate(Duration.days(0));
    }).toThrow(/Duration cannot be 0/);
  });

  test('rate can be from a token', () => {
    const stack = new Stack();
    const lazyDuration = Duration.minutes(Lazy.number({ produce: () => 5 }));
    const rate = events.Schedule.rate(lazyDuration);
    expect('rate(5 minutes)').toEqual(stack.resolve(rate).expressionString);
  });

  test('rate can be in minutes', () => {
    expect('rate(10 minutes)').toEqual(
      events.Schedule.rate(Duration.minutes(10))
        .expressionString);
  });

  test('rate can be in days', () => {
    expect('rate(10 days)').toEqual(
      events.Schedule.rate(Duration.days(10))
        .expressionString);
  });

  test('rate can be in hours', () => {
    expect('rate(10 hours)').toEqual(
      events.Schedule.rate(Duration.hours(10))
        .expressionString);
  });

  test('rate can be in seconds', () => {
    expect('rate(2 minutes)').toEqual(
      events.Schedule.rate(Duration.seconds(120))
        .expressionString);
  });

  test('rate must not be in seconds when specified as a token', () => {
    expect(() => {
      events.Schedule.rate(Duration.seconds(Lazy.number({ produce: () => 5 })));
    }).toThrow(/Allowed units for scheduling/);
  });
});
